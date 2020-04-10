on run argv
  set account to item 1 of argv
  set startDate to item 2 of argv
  tell application "MoneyMoney" to export transactions from account account from date startDate as "plist"
end run
