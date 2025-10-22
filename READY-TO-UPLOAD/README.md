# TN News Website Upload Package

This folder contains all files needed to upload the Trending News website to your web server. The files are organized in a static HTML structure for easy deployment on any hosting service.

## Directory Structure

- `index.html` - Homepage
- `about.html` - About Us page
- `contact.html` - Contact page
- `css/` - Contains all styling files
- `js/` - Contains JavaScript files
- `images/` - Contains images and logo

## Upload Instructions

### Option 1: Using FileZilla

1. **Open FileZilla** and connect to your server:
   - Host: Your FTP server address (e.g., ftp.trendingnews.org.za)
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (standard FTP port)

2. **Navigate to your public_html directory** on the server (right panel)

3. **Upload all files from this folder** to that directory:
   - Select all files and folders in this directory
   - Right-click and select "Upload"
   - Wait for the upload to complete

4. **Verify file permissions**:
   - HTML files: 644
   - CSS/JS files: 644
   - Images: 644
   - Folders: 755

### Option 2: Using cPanel File Manager

1. **Login to your hosting cPanel**

2. **Open File Manager** and navigate to public_html

3. **Upload all files and folders**:
   - Click "Upload" button
   - Select all files and folders from this directory
   - Wait for upload to complete

## Post-Upload Verification

After uploading, visit your website to verify everything is working:

1. Check that the homepage loads with proper styling
2. Test navigation links to About and Contact pages
3. Verify that images are loading correctly
4. Test the search functionality and form submissions

If you encounter any issues:
- Ensure all files were uploaded correctly
- Check that file paths are correct (no missing files)
- Verify that your domain is properly pointing to the hosting

## Support

For any issues with the website after upload, contact:
- support@trendingnews.com