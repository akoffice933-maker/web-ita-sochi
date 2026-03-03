# Upload all images to hosting
# Run in PowerShell

$ftpServer = "ftp://school-board.online/"
$ftpUsername = "infoitaso3_board"
$ftpPassword = "HGKHGJFGasadsdf12##"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "UPLOAD IMAGES" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Function to upload file
function Upload-File {
    param ($localFile, $remoteFile)
    
    try {
        $request = [System.Net.FtpWebRequest]::Create("$ftpServer$remoteFile")
        $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $request.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
        $request.UsePassive = $true
        $request.UseBinary = $true
        
        $fileContent = [System.IO.File]::ReadAllBytes($localFile)
        $request.ContentLength = $fileContent.Length
        
        $requestStream = $request.GetRequestStream()
        $requestStream.Write($fileContent, 0, $fileContent.Length)
        $requestStream.Close()
        
        Write-Host "OK: $remoteFile" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "ERROR: $remoteFile" -ForegroundColor Red
        return $false
    }
}

Write-Host "Uploading main images..." -ForegroundColor Yellow

# Get all image files
$imageExtensions = @("*.jpg", "*.jpeg", "*.png", "*.svg", "*.webp", "*.gif")
$uploadedCount = 0
$errorCount = 0

foreach ($ext in $imageExtensions) {
    $files = Get-ChildItem "d:\web ita-sochi\images" -Filter $ext -File
    
    foreach ($file in $files) {
        $result = Upload-File $file.FullName "/images/$($file.Name)"
        if ($result) {
            $uploadedCount++
        } else {
            $errorCount++
        }
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "UPLOAD COMPLETE!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Uploaded: $uploadedCount files" -ForegroundColor Cyan
Write-Host "Errors: $errorCount files" -ForegroundColor $(if ($errorCount -eq 0) {"Green"} else {"Red"})
Write-Host ""
Write-Host "Check: http://school-board.online/images/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter to exit"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
