# Загрузка калькулятора на хостинг

$ftpServer = "ftp://school-board.online/"
$ftpUsername = "infoitaso3_board"
$ftpPassword = "HGKHGJFGasadsdf12##"

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
    }
    catch {
        Write-Host "ERROR: $remoteFile" -ForegroundColor Red
    }
}

Write-Host "Загрузка калькулятора..." -ForegroundColor Cyan

# Создаем папку calculator
Write-Host "Создание папки calculator/..." -ForegroundColor Yellow

# Загружаем файлы калькулятора
$files = @(
    "index.html",
    ".htaccess",
    "database.sql",
    "config.example.php",
    "config.php",
    "composer.json",
    "README.md",
    "INSTALL.md"
)

foreach ($file in $files) {
    $local = "d:\web ita-sochi\calculator\$file"
    if (Test-Path $local) {
        Upload-File -localFile $local -remoteFile "/calculator/$file"
    }
}

# Загружаем папки
$folders = @("api", "css", "js", "images", "includes")

foreach ($folder in $folders) {
    Write-Host "Загрузка папки $folder/..." -ForegroundColor Yellow
    $localFolder = "d:\web ita-sochi\calculator\$folder"
    if (Test-Path $localFolder) {
        Get-ChildItem -Path $localFolder -File -Recurse | ForEach-Object {
            $relativePath = $_.FullName.Replace("d:\web ita-sochi\calculator\", "").Replace("\", "/")
            Upload-File -localFile $_.FullName -remoteFile "/calculator/$relativePath"
        }
    }
}

Write-Host ""
Write-Host "Загрузка завершена!" -ForegroundColor Green
Write-Host "Проверьте: http://school-board.online/calculator/" -ForegroundColor Cyan
Write-Host ""
Read-Host "Нажмите Enter"
