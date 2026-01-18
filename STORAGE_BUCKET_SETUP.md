# Storage Bucket Setup for Study Log Attachments

## Step 1: Create Storage Bucket

1. **Go to Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Enter bucket name: `study-attachments`
4. Make it **Public** (check the "Public bucket" option)
5. Click **Create bucket**

## Step 2: Set Storage Policies (Optional but Recommended)

If you want to restrict who can upload/access files:

1. Go to **Storage** → **Policies** → **study-attachments**
2. Click **"New Policy"**

### Upload Policy (Authenticated users only):

```sql
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'study-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Read Policy (Public access):

```sql
CREATE POLICY "Anyone can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'study-attachments');
```

### Delete Policy (Users can delete their own files):

```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'study-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 3: Update Database Schema

Run the updated SQL in **SQL Editor**:

The `study_logs` table now includes an `attachments` column (JSONB) to store file metadata.

## Step 4: Test File Upload

1. Go to your app's study log page
2. Click "Log Study Session"
3. Fill in subject and duration
4. Click the file input to select PDFs, images, or documents
5. You can attach multiple files
6. Click "Save Log"

Files will be uploaded to Supabase Storage and links saved in the database.

## Supported File Types

- PDFs (`.pdf`)
- Word Documents (`.doc`, `.docx`)
- Text files (`.txt`)
- Images (`.png`, `.jpg`, `.jpeg`)

## File Size Limits

By default, Supabase allows up to **50MB** per file on the free tier.
For larger files, upgrade your Supabase plan.

## Troubleshooting

### Error: "Bucket not found"

- Make sure you created the `study-attachments` bucket in Supabase Storage
- Verify the bucket name matches exactly

### Error: "Permission denied"

- Ensure the bucket is set to **Public**
- Or add the storage policies mentioned above

### Files not appearing

- Check browser console for upload errors
- Verify the file size is under 50MB
- Check Supabase Storage dashboard to see if files were uploaded
