import AWS from 'aws-sdk'

// Konfigurera AWS SDK för Cloudflare R2
const r2 = new AWS.S3({
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  region: 'auto', // Cloudflare R2 använder 'auto'
})

const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL!

export interface UploadFileOptions {
  file: Buffer
  filename: string
  contentType: string
  isPublic?: boolean
  leadId?: string
  companyId: string
  uploadedById: string
}

export interface UploadedFile {
  id: string
  r2Key: string
  publicUrl?: string
  filename: string
  fileSize: number
}

/**
 * Laddar upp en fil till Cloudflare R2
 */
export async function uploadFile({
  file,
  filename,
  contentType,
  isPublic = false,
  leadId,
  companyId,
  uploadedById,
}: UploadFileOptions): Promise<UploadedFile> {
  try {
    // Generera unik filnamn
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2)
    const fileExtension = filename.split('.').pop()
    const r2Key = `${companyId}/${leadId || 'general'}/${timestamp}_${randomId}.${fileExtension}`

    // Ladda upp till R2
    const uploadParams = {
      Bucket: bucketName,
      Key: r2Key,
      Body: file,
      ContentType: contentType,
      Metadata: {
        'original-filename': filename,
        'company-id': companyId,
        'uploaded-by': uploadedById,
        ...(leadId && { 'lead-id': leadId }),
      },
    }

    if (isPublic) {
      uploadParams.ACL = 'public-read'
    }

    const result = await r2.upload(uploadParams).promise()

    // Lagra metadata i Supabase
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()

    const { data: fileRecord, error } = await supabase
      .from('files')
      .insert({
        company_id: companyId,
        lead_id: leadId,
        uploaded_by_id: uploadedById,
        filename: `${timestamp}_${randomId}.${fileExtension}`,
        original_filename: filename,
        mime_type: contentType,
        file_size: file.length,
        r2_key: r2Key,
        public_url: isPublic ? `${publicUrl}/${r2Key}` : null,
        is_public: isPublic,
      })
      .select()
      .single()

    if (error) {
      // Om databasfel, försök ta bort filen från R2
      await r2.deleteObject({ Bucket: bucketName, Key: r2Key }).promise()
      throw new Error(`Database error: ${error.message}`)
    }

    return {
      id: fileRecord.id,
      r2Key,
      publicUrl: isPublic ? `${publicUrl}/${r2Key}` : undefined,
      filename: fileRecord.filename,
      fileSize: file.length,
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

/**
 * Genererar en signerad URL för att ladda ner privata filer
 */
export async function getSignedDownloadUrl(r2Key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const params = {
      Bucket: bucketName,
      Key: r2Key,
      Expires: expiresIn, // Sekunder
    }

    return r2.getSignedUrl('getObject', params)
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw error
  }
}

/**
 * Ta bort en fil från R2 och databas
 */
export async function deleteFile(fileId: string, companyId: string): Promise<void> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()

    // Hämta filens metadata
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('r2_key')
      .eq('id', fileId)
      .eq('company_id', companyId)
      .single()

    if (fetchError || !file) {
      throw new Error('File not found')
    }

    // Ta bort från R2
    await r2.deleteObject({
      Bucket: bucketName,
      Key: file.r2_key,
    }).promise()

    // Ta bort från databas
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)
      .eq('company_id', companyId)

    if (deleteError) {
      throw new Error(`Database error: ${deleteError.message}`)
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

/**
 * Lista filer för en lead eller företag
 */
export async function listFiles(companyId: string, leadId?: string) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()

    let query = supabase
      .from('files')
      .select(`
        id,
        filename,
        original_filename,
        mime_type,
        file_size,
        public_url,
        is_public,
        created_at,
        user_profiles!uploaded_by_id (
          first_name,
          last_name
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (leadId) {
      query = query.eq('lead_id', leadId)
    }

    const { data: files, error } = await query

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return files
  } catch (error) {
    console.error('Error listing files:', error)
    throw error
  }
}
