import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { imageUrl, specifications, aiPrompt, conversationId, price, description, style } = body

    if (!imageUrl || !specifications) {
      return NextResponse.json({ error: 'Image URL and specifications required' }, { status: 400 })
    }

    // Create a hash of the specifications to enable smart reuse
    const specHash = crypto.createHash('md5').update(JSON.stringify(specifications)).digest('hex')

    // Check if we already have this exact image
    const { data: existingPreview } = await supabase
      .from('cake_previews')
      .select('*')
      .eq('hash', specHash)
      .single()

    if (existingPreview) {
      // Increment reuse count
      await supabase
        .from('cake_previews')
        .update({ reuse_count: existingPreview.reuse_count + 1 })
        .eq('id', existingPreview.id)

      return NextResponse.json({
        success: true,
        preview: existingPreview,
        reused: true
      })
    }

    // Download and store the image to Supabase Storage
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image')
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const fileName = `cake-previews/${Date.now()}-${Math.random().toString(36).substring(7)}.png`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cake-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600'
      })

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('cake-images')
      .getPublicUrl(fileName)

    // Save preview to database
    const { data: previewData, error: previewError } = await supabase
      .from('cake_previews')
      .insert({
        conversation_id: conversationId,
        image_url: publicUrlData.publicUrl,
        storage_path: fileName,
        description,
        specifications,
        ai_prompt: aiPrompt,
        price,
        hash: specHash,
        reuse_count: 1
      })
      .select()
      .single()

    if (previewError) {
      throw new Error(`Failed to save preview: ${previewError.message}`)
    }

    return NextResponse.json({
      success: true,
      preview: previewData,
      reused: false
    })

  } catch (error) {
    console.error('Error saving preview image:', error)
    return NextResponse.json(
      { error: 'Failed to save preview image' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const conversationId = searchParams.get('conversationId')

    let query = supabase
      .from('cake_previews')
      .select(`
        *,
        ai_conversations (
          user_id,
          user_profiles (full_name)
        )
      `)
      .order('generated_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (conversationId) {
      query = query.eq('conversation_id', conversationId)
    }

    const { data: previews, error } = await query

    if (error) {
      throw new Error(`Failed to fetch previews: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      previews
    })

  } catch (error) {
    console.error('Error fetching preview images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preview images' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { previewId, status, approvedBy } = body

    if (!previewId || !status) {
      return NextResponse.json({ error: 'Preview ID and status required' }, { status: 400 })
    }

    const updateData: any = { status }
    
    if (status === 'approved') {
      updateData.approved_by = approvedBy || user.id
      updateData.approved_at = new Date().toISOString()
    }

    const { data: updatedPreview, error } = await supabase
      .from('cake_previews')
      .update(updateData)
      .eq('id', previewId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update preview: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      preview: updatedPreview
    })

  } catch (error) {
    console.error('Error updating preview image:', error)
    return NextResponse.json(
      { error: 'Failed to update preview image' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const previewId = searchParams.get('id')

    if (!previewId) {
      return NextResponse.json({ error: 'Preview ID required' }, { status: 400 })
    }

    // Get the preview to get storage path
    const { data: preview, error: fetchError } = await supabase
      .from('cake_previews')
      .select('storage_path')
      .eq('id', previewId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch preview: ${fetchError.message}`)
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('cake-images')
      .remove([preview.storage_path])

    if (storageError) {
      console.error('Failed to delete from storage:', storageError)
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('cake_previews')
      .delete()
      .eq('id', previewId)

    if (deleteError) {
      throw new Error(`Failed to delete preview: ${deleteError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Preview deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting preview image:', error)
    return NextResponse.json(
      { error: 'Failed to delete preview image' },
      { status: 500 }
    )
  }
}