echo "Creating user and creating db"
sudo mysql < ./sql/initial_script.sql
echo "users table created"
mysql --password=password --user=vkharkivsk < ./sql/users.sql
echo "company table created"
mysql --password=password --user=vkharkivsk < ./sql/company.sql
echo "event table created"
mysql --password=password --user=vkharkivsk < ./sql/event.sql
echo "comment table created"
mysql --password=password --user=vkharkivsk < ./sql/comment.sql
echo "location table created"
mysql --password=password --user=vkharkivsk < ./sql/location.sql
echo "event_subscription table created"
mysql --password=password --user=vkharkivsk < ./sql/event_subscription.sql
echo "company_subscription table created"
mysql --password=password --user=vkharkivsk < ./sql/company_subscription.sql
echo "notification table created"
mysql --password=password --user=vkharkivsk < ./sql/notification.sql
echo "ticket table created"
mysql --password=password --user=vkharkivsk < ./sql/ticket.sql
echo "promocode table created"
mysql --password=password --user=vkharkivsk < ./sql/promocode.sql
echo "user_promocode table created"
mysql --password=password --user=vkharkivsk < ./sql/user_promocode.sql