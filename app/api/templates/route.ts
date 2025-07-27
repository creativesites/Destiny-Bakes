import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      description, 
      imageUrl, 
      specifications, 
      price, 
      category, 
      difficultyLevel, 
      tags,
      storagePath 
    } = body

    if (!name || !imageUrl || !specifications || !category) {
      return NextResponse.json({ 
        error: 'Name, image URL, specifications, and category are required' 
      }, { status: 400 })
    }

    // Get user profile to check permissions
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('clerk_user_id', user.id)
      .single()

    const isAdmin = userProfile?.role === 'admin'

    // Save template to database
    const { data: templateData, error: templateError } = await supabase
      .from('cake_templates')
      .insert({
        name,
        description,
        image_url: imageUrl,
        storage_path: storagePath,
        specifications,
        price,
        category,
        difficulty_level: difficultyLevel || 1,
        created_by: user.id,
        status: isAdmin ? 'approved' : 'pending',
        approved_by: isAdmin ? user.id : null,
        approved_at: isAdmin ? new Date().toISOString() : null,
        tags: tags || [],
        use_count: 0
      })
      .select()
      .single()

    if (templateError) {
      throw new Error(`Failed to save template: ${templateError.message}`)
    }

    return NextResponse.json({
      success: true,
      template: templateData
    })

  } catch (error) {
    console.error('Error saving template:', error)
    return NextResponse.json(
      { error: 'Failed to save template' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const userId = searchParams.get('userId')
    const adminView = searchParams.get('adminView') === 'true'

    let query = supabase
      .from('cake_templates')
      .select(`
        *,
        created_by_profile:user_profiles!created_by (full_name),
        approved_by_profile:user_profiles!approved_by (full_name)
      `)
      .order('created_at', { ascending: false })

    // For public view, only show approved templates
    if (!adminView) {
      query = query.eq('status', 'approved')
      query = query.eq('is_public', true)
    }

    if (status && adminView) {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (featured === 'true') {
      query = query.eq('status', 'featured')
    }

    if (userId) {
      query = query.eq('created_by', userId)
    }

    const { data: templates, error } = await query

    if (error) {
      throw new Error(`Failed to fetch templates: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      templates
    })

  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
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
    const { templateId, status, name, description, category, tags, difficultyLevel, isPublic } = body

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    // Check if user is admin or template owner
    const { data: template } = await supabase
      .from('cake_templates')
      .select('created_by')
      .eq('id', templateId)
      .single()

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('clerk_user_id', user.id)
      .single()

    const isAdmin = userProfile?.role === 'admin'
    const isOwner = template?.created_by === user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updateData: any = {}

    // Only admins can change status
    if (status && isAdmin) {
      updateData.status = status
      if (status === 'approved' || status === 'featured') {
        updateData.approved_by = user.id
        updateData.approved_at = new Date().toISOString()
      }
    }

    // Owners and admins can update other fields
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (tags !== undefined) updateData.tags = tags
    if (difficultyLevel !== undefined) updateData.difficulty_level = difficultyLevel
    if (isPublic !== undefined) updateData.is_public = isPublic

    const { data: updatedTemplate, error } = await supabase
      .from('cake_templates')
      .update(updateData)
      .eq('id', templateId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update template: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      template: updatedTemplate
    })

  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
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
    const templateId = searchParams.get('id')

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    // Check if user is admin or template owner
    const { data: template, error: fetchError } = await supabase
      .from('cake_templates')
      .select('created_by, storage_path')
      .eq('id', templateId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch template: ${fetchError.message}`)
    }

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('clerk_user_id', user.id)
      .single()

    const isAdmin = userProfile?.role === 'admin'
    const isOwner = template?.created_by === user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete from storage if storage path exists
    if (template.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('cake-images')
        .remove([template.storage_path])

      if (storageError) {
        console.error('Failed to delete from storage:', storageError)
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('cake_templates')
      .delete()
      .eq('id', templateId)

    if (deleteError) {
      throw new Error(`Failed to delete template: ${deleteError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}