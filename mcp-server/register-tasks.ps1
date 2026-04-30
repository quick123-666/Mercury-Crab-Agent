$TASK_SCRIPT = "C:\Users\Administrator\Documents\GitHub\Mercury-Crab-Agent\mcp-server\run-tool.bat"
$TASK_NAME_PREFIX = "MercuryCrab"
$ONE_YEAR = (New-TimeSpan -Days 365)

function Register-MercuryTask {
    param(
        [string]$Name,
        [string]$Arguments,
        [TimeSpan]$Interval,
        [string]$Description
    )

    $fullName = "${TASK_NAME_PREFIX}_${Name}"
    $startTime = (Get-Date).Date.AddHours(8)

    Unregister-ScheduledTask -TaskName $fullName -Confirm:$false -ErrorAction SilentlyContinue

    $trigger = New-ScheduledTaskTrigger -Once -At $startTime -RepetitionInterval $Interval -RepetitionDuration $ONE_YEAR
    $action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$TASK_SCRIPT`" $Arguments" -WorkingDirectory (Split-Path $TASK_SCRIPT -Parent)
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10)

    Register-ScheduledTask -TaskName $fullName -Action $action -Trigger $trigger -Settings $settings -Description $Description -User "SYSTEM" -Force

    Write-Host "  ✓ $fullName (every $($Interval.TotalHours)h) - $Description"
}

Write-Host "`n=== Registering Mercury-Crab-Agent Scheduled Tasks ===`n"

Register-MercuryTask -Name "KnowledgeSync" -Arguments "wiki_status" -Interval (New-TimeSpan -Hours 4) -Description "Wiki knowledge base status check"
Register-MercuryTask -Name "SessionSummary" -Arguments "session_summary --recent 5" -Interval (New-TimeSpan -Hours 8) -Description "Process sessions and extract summaries"
Register-MercuryTask -Name "SelfImprovingScan" -Arguments "pattern_scan" -Interval (New-TimeSpan -Hours 6) -Description "Scan corrections for repeated patterns"
Register-MercuryTask -Name "SessionTitleGen" -Arguments "session_title_gen --recent 5" -Interval (New-TimeSpan -Hours 10) -Description "Generate session titles"
Register-MercuryTask -Name "MemoryMaintenance" -Arguments "heartbeat_check" -Interval (New-TimeSpan -Hours 10) -Description "Heartbeat check and memory maintenance"

# Weekly cleanup (Mon/Wed/Fri/Sun 3:00 AM)
$weeklyName = "${TASK_NAME_PREFIX}_SnapshotCleanup"
Unregister-ScheduledTask -TaskName $weeklyName -Confirm:$false -ErrorAction SilentlyContinue
$weeklyTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Wednesday,Friday,Sunday -At "03:00"
$weeklyAction = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$TASK_SCRIPT`" memory_list" -WorkingDirectory (Split-Path $TASK_SCRIPT -Parent)
$weeklySettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
Register-ScheduledTask -TaskName $weeklyName -Action $weeklyAction -Trigger $weeklyTrigger -Settings $weeklySettings -Description "Snapshot cleanup Mon/Wed/Fri/Sun 3:00 AM" -User "SYSTEM" -Force
Write-Host "  ✓ $weeklyName (Mon/Wed/Fri/Sun 3:00) - Snapshot cleanup"

Write-Host "`n=== All 6 tasks registered ===`n"
