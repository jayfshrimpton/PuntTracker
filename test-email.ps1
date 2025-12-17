# PowerShell script to test email endpoints
# Usage: .\test-email.ps1 [-skip-check]
# Make sure your Next.js dev server is running: npm run dev

# Set your admin secret here
$ADMIN_SECRET = "973fa48aea83ca9fb7002643b6ff859ef297fbe7fe358d78849309f2ef257327"
$BASE_URL = "http://localhost:3000"

# Headers
$headers = @{
    "Authorization" = "Bearer $ADMIN_SECRET"
}

Write-Host "Testing Email Endpoints..." -ForegroundColor Cyan
Write-Host ""

# Optional: Skip server check if you know it's running
$skipCheck = $false
if ($args -contains "-skip-check" -or $args -contains "--skip") {
    $skipCheck = $true
    Write-Host "[INFO] Skipping server check (using -skip-check flag)" -ForegroundColor Gray
    Write-Host ""
}

# Check if server is running
if (-not $skipCheck) {
    Write-Host "Checking if dev server is running..." -ForegroundColor Yellow
    $serverRunning = $false

    # Try multiple ways to check if server is running
    try {
        # Try the root URL
        $testResponse = Invoke-WebRequest -Uri "$BASE_URL" -Method GET -TimeoutSec 5 -ErrorAction Stop
        $serverRunning = $true
        Write-Host "   [OK] Server is running on $BASE_URL!" -ForegroundColor Green
    } catch {
        # Try the API endpoint directly
        try {
            $testResponse = Invoke-WebRequest -Uri "$BASE_URL/api/test/emails" -Method GET -TimeoutSec 5 -ErrorAction Stop
            $serverRunning = $true
            Write-Host "   [OK] Server is running (detected via API endpoint)!" -ForegroundColor Green
        } catch {
            # Check if it's a connection error vs other error
            if ($_.Exception.Message -like "*Unable to connect*" -or $_.Exception.Message -like "*connection*") {
                Write-Host "   [WARNING] Cannot connect to server at $BASE_URL" -ForegroundColor Yellow
                Write-Host "   Checking if server might be on a different port..." -ForegroundColor Gray
                
                # Try common alternative ports
                $ports = @(3001, 3002, 8080, 5000)
                foreach ($port in $ports) {
                    try {
                        $altUrl = "http://localhost:$port"
                        $testAlt = Invoke-WebRequest -Uri "$altUrl" -Method GET -TimeoutSec 2 -ErrorAction Stop
                        Write-Host "   [INFO] Found server running on port $port!" -ForegroundColor Cyan
                        Write-Host "   Updating BASE_URL to $altUrl" -ForegroundColor Cyan
                        $BASE_URL = $altUrl
                        $serverRunning = $true
                        break
                    } catch {
                        # Continue checking other ports
                    }
                }
                
                if (-not $serverRunning) {
                    Write-Host ""
                    Write-Host "   [ERROR] Server not found on common ports (3000, 3001, 3002, 8080, 5000)" -ForegroundColor Red
                    Write-Host ""
                    Write-Host "Please verify:" -ForegroundColor Yellow
                    Write-Host "   1. Dev server is running: npm run dev" -ForegroundColor Cyan
                    Write-Host "   2. Check what port it's running on (should show in terminal)" -ForegroundColor Cyan
                    Write-Host "   3. Update BASE_URL in this script if using a different port" -ForegroundColor Cyan
                    Write-Host ""
                    Write-Host "Or continue anyway to test with current URL..." -ForegroundColor Yellow
                    $continue = Read-Host "Continue anyway? (y/n)"
                    if ($continue -ne "y" -and $continue -ne "Y") {
                        exit
                    }
                }
            } else {
                # Other error - might be 404 or auth error, but server is running
                Write-Host "   [INFO] Server appears to be running (got response, not connection error)" -ForegroundColor Green
                $serverRunning = $true
            }
        }
    }
    Write-Host ""
} else {
    Write-Host "[INFO] Proceeding with tests (server check skipped)" -ForegroundColor Gray
    Write-Host ""
}

# Test Verification Email
Write-Host "1. Testing Verification Email..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/test/emails?type=verification" -Headers $headers -Method GET
    Write-Host "   [OK] Success!" -ForegroundColor Green
    Write-Host "   Result: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "   [ERROR] Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test Password Reset Email
Write-Host "2. Testing Password Reset Email..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/test/emails?type=reset" -Headers $headers -Method GET
    Write-Host "   [OK] Success!" -ForegroundColor Green
    Write-Host "   Result: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "   [ERROR] Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test Monthly Summary Email
Write-Host "3. Testing Monthly Summary Email..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/test/emails?type=summary" -Headers $headers -Method GET
    Write-Host "   [OK] Success!" -ForegroundColor Green
    Write-Host "   Result: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "   [ERROR] Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test All Emails
Write-Host "4. Testing All Emails..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/test/emails?type=all" -Headers $headers -Method GET
    Write-Host "   [OK] Success!" -ForegroundColor Green
    Write-Host "   Result: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "   [ERROR] Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "Done! Check your email inbox: jayfshrimpton@gmail.com" -ForegroundColor Cyan
