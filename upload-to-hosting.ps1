# Скрипт для загрузки сайта на хостинг через FTP
# Запустите этот скрипт в PowerShell

# ==================== НАСТРОЙКИ ====================

$ftpServer = "ftp://school-board.online/"
$ftpUsername = "infoitaso3_board"
$ftpPassword = "ВАШ_ПАРОЛЬ"  # ← ВВЕДИТЕ ВАШ ПАРОЛЬ ЗДЕСЬ

$localPath = "d:\web ita-sochi"
$remotePath = "/public_html/"

# ==================== ФУНКЦИИ ====================

function Upload-File {
    param (
        [string]$localFile,
        [string]$remoteFile
    )
    
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
        
        Write-Host "✓ Загружено: $remoteFile" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Ошибка загрузки $remoteFile : $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Upload-Directory {
    param (
        [string]$localDir,
        [string]$remoteDir
    )
    
    # Создаем директорию на сервере (если нужно)
    Write-Host "Создание директории: $remoteDir" -ForegroundColor Yellow
    
    # Загружаем файлы из директории
    Get-ChildItem -Path $localDir -File | ForEach-Object {
        $remoteFile = "$remoteDir$($_.Name)"
        Upload-File -localFile $_.FullName -remoteFile $remoteFile
    }
}

# ==================== ЗАГРУЗКА ====================

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "ЗАГРУЗКА САЙТА НА ХОСТИНГ" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Сервер: $ftpServer" -ForegroundColor White
Write-Host "Пользователь: $ftpUsername" -ForegroundColor White
Write-Host "Локальная папка: $localPath" -ForegroundColor White
Write-Host ""

# Проверка подключения
Write-Host "Проверка подключения..." -ForegroundColor Yellow
try {
    $testRequest = [System.Net.FtpWebRequest]::Create($ftpServer)
    $testRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $testRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
    $testResponse = $testRequest.GetResponse()
    Write-Host "✓ Подключение успешно!" -ForegroundColor Green
    $testResponse.Close()
}
catch {
    Write-Host "✗ Ошибка подключения: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Проверьте логин, пароль и доступность сервера" -ForegroundColor Yellow
    Read-Host "Нажмите Enter для выхода"
    exit
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "НАЧАЛО ЗАГРУЗКИ ФАЙЛОВ" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Загрузка основных файлов
Write-Host "Загрузка основных файлов..." -ForegroundColor Yellow
$rootFiles = @(
    "index.html",
    ".htaccess",
    "favicon.svg",
    "robots.txt",
    "sitemap.xml",
    "submit.php",
    "privacy-policy.html",
    "README.md"
)

foreach ($file in $rootFiles) {
    $localFile = Join-Path $localPath $file
    if (Test-Path $localFile) {
        Upload-File -localFile $localFile -remoteFile "$remotePath$file"
    }
}

Write-Host ""
Write-Host "Загрузка папки css/..." -ForegroundColor Yellow
Upload-Directory -localDir "$localPath\css" -remoteDir "$remotePath/css/"

Write-Host "Загрузка папки js/..." -ForegroundColor Yellow
Upload-Directory -localDir "$localPath\js" -remoteDir "$remotePath/js/"

Write-Host "Загрузка папки images/..." -ForegroundColor Yellow
Upload-Directory -localDir "$localPath\images" -remoteDir "$remotePath/images/"

Write-Host "Загрузка папки pages/..." -ForegroundColor Yellow
Upload-Directory -localDir "$localPath\pages" -remoteDir "$remotePath/pages/"

Write-Host "Загрузка папки calculator/..." -ForegroundColor Yellow
Upload-Directory -localDir "$localPath\calculator" -remoteDir "$remotePath/calculator/"

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "ЗАГРУЗКА ЗАВЕРШЕНА!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Проверьте сайт:" -ForegroundColor Cyan
Write-Host "https://school-board.online/" -ForegroundColor White
Write-Host "https://school-board.online/calculator/" -ForegroundColor White
Write-Host ""

Read-Host "Нажмите Enter для выхода"
