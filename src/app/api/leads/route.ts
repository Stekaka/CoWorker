import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

// Schema för validering av lead-data
const createLeadSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST', 'INACTIVE']).optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
  assigned_to_id: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// GET /api/leads - Hämta alla leads för företaget
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')

    // Bygg query baserat på filter
    let query = supabase
      .from('leads')
      .select(`
        *,
        assigned_to:user_profiles!assigned_to_id(id, first_name, last_name),
        created_by:user_profiles!created_by_id(id, first_name, last_name)
      `)
      .eq('company_id', user.company_id)
      .eq('is_active', true)

    // Om användaren inte är admin, visa bara deras tilldelade leads
    if (user.role !== 'ADMIN') {
      query = query.eq('assigned_to_id', user.id)
    }

    // Lägg till filter
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (assignedTo && user.role === 'ADMIN') {
      query = query.eq('assigned_to_id', assignedTo)
    }

    // Paginering
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: leads, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/leads - Skapa ny lead
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const body = await request.json()
    const validatedData = createLeadSchema.parse(body)

    const { tags, ...leadData } = validatedData

    // Skapa lead
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        ...leadData,
        company_id: user.company_id,
        created_by_id: user.id,
        assigned_to_id: validatedData.assigned_to_id || user.id, // Tilldela till skaparen om ingen annan angiven
      })
      .select(`
        *,
        assigned_to:user_profiles!assigned_to_id(id, first_name, last_name),
        created_by:user_profiles!created_by_id(id, first_name, last_name)
      `)
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
    }

    // Hantera taggar om de finns
    if (tags && tags.length > 0) {
      // Skapa taggar först
      const tagPromises = tags.map(async (tagName) => {
        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .eq('company_id', user.company_id)
          .single()

        if (existingTag) {
          return existingTag
        }

        const { data: newTag, error } = await supabase
          .from('tags')
          .insert({
            name: tagName,
            company_id: user.company_id,
          })
          .select('id')
          .single()

        if (error) {
          console.error('Error creating tag:', error)
          return null
        }

        return newTag
      })

      const tagRecords = await Promise.all(tagPromises)
      const validTags = tagRecords.filter(Boolean)

      // Koppla taggar till lead
      if (validTags.length > 0) {
        await supabase
          .from('lead_tags')
          .insert(
            validTags.map(tag => ({
              lead_id: lead.id,
              tag_id: tag.id,
            }))
          )
      }
    }

    return NextResponse.json({
      success: true,
      data: lead,
      message: 'Lead skapad framgångsrikt',
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
