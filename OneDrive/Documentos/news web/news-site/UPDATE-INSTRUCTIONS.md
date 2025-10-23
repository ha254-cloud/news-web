# How to Update Your News Site

This document explains how to keep your static news site updated with fresh content.

## Manual Updates

### 1. Update the Articles Data
1. Open `production-build/js/static-articles.js`
2. Replace the article data with new content
3. Upload the updated file to your server

### 2. Update via Script
1. Run the auto-update script: `node scripts/auto-update.js`
2. This will pull the latest articles from your data source
3. Upload the updated files to your server using FTP

## Automatic Updates

### Setting Up a Scheduled Task (Windows)

1. Open Windows Task Scheduler
2. Create a new task
3. Set the action to run: `C:\Users\user\OneDrive\Documentos\news web\news-site\scripts\update-site.bat`
4. Schedule it to run daily (or at your preferred interval)

### Setting Up a Cron Job (Linux/Mac)

```bash
# Add to crontab to run daily at 1:00 AM
0 1 * * * cd /path/to/news-site && node scripts/auto-update.js
```

## FTP Deployment

To upload via FTP:

1. Edit the FTP credentials in `scripts/ftp-upload.js`
2. Install dependencies: `npm install basic-ftp`
3. Run the upload script: `node scripts/ftp-upload.js`

## Update Notification System

The site includes a notification system that will inform users when new content is available:

1. When updating your site, also update the version number in `update-info.json`
2. Visitors will see a notification to refresh for new content

## Best Practices

- Update content regularly (daily or weekly)
- Keep your image paths consistent
- Test locally before uploading
- Maintain consistent formatting of article data

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify all file paths are correct
3. Ensure the JSON data format is valid
4. Check FTP credentials if uploads fail