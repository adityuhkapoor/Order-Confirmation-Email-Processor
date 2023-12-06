function markAsRead() {
  var unreadEmails = GmailApp.search('is:unread'); // Checks if email is unread
  var dateObj = new Date();
  var month = String(dateObj.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-based
  var day = String(dateObj.getDate()).padStart(2, '0');
  var year = String(dateObj.getFullYear()).substring(2);
  var currentDate = month + '/' + day + '/' + year;

  // Access the Google Sheet
  var sheet = SpreadsheetApp.openById('INSERT-SHEET-ID-HERE').getSheetByName('INSERT-SHEET-NAME-HERE'); //Sheet ID is located in link bar, Sheet name is located within spreadsheet itself at the bottom.

  for (var i = 0; i < unreadEmails.length; i++) {
    var messages = unreadEmails[i].getMessages();
    var pattern = /^Fwd: You Got Tickets To \b/; // This is oriented towards Ticketmaster emails.

    for (var j = 0; j < messages.length; j++) {
      var emailSubject = messages[j].getSubject();
      // Get the email address the email was sent to (very useful if you utilize automatic email forwarding)
      var email = messages[j].getTo();
      
      if (pattern.test(emailSubject)) {
        var bodyPlainText = messages[j].getPlainBody();
        Logger.log(bodyPlainText);
        // Extract Ticket Name
        var subjectPattern = /Fwd: You Got Tickets To (.*)/;
        var subjectMatch = emailSubject.match(subjectPattern);
        var ticketDetail = subjectMatch ? subjectMatch[1] : "";
        
        // Extract Buy Price
        var buyPricePattern = /Total: \$\s*([\d,]+\.\d{2})/;
        var buyPriceMatch = bodyPlainText.match(buyPricePattern);
        var buyPrice = buyPriceMatch ? buyPriceMatch[1] : "";

        // Extract Order Number
        var orderPattern = /Order # (\d+-\d+\/[A-Za-z\d]+)/; 
        var orderNumberMatch = bodyPlainText.match(orderPattern);
        var orderNumber = orderNumberMatch ? orderNumberMatch[1] : "";

        // Extract Date
        var datePattern = /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun) · ([A-Za-z]{3} \d{1,2}, \d{4}) ·/;
        var dateMatch = bodyPlainText.match(datePattern);
        var date = dateMatch ? dateMatch[2] : "";

        // Extract Venue
        var venuePattern = /\n(.*? — )/;
        var venueMatch = bodyPlainText.match(venuePattern);
        var venue = venueMatch ? venueMatch[1].replace(' — ', '') : "";

        // Extract Location
        var locationPattern = /([\w\s]+,\s*[\w\s]+)\s+Get Directions/;
        var locationMatch = bodyPlainText.match(locationPattern);
        var location = locationMatch ? locationMatch[1].trim() : "";

        // Extract Payment Method
        var paymentMethodPattern = /(.+? — .+\d{1,4}).+Total:/;  // Uses REGEX to locate Total:
        var paymentMethodMatch = bodyPlainText.match(paymentMethodPattern);
        var paymentMethod = paymentMethodMatch ? paymentMethodMatch[1] : "";



        // Append the extracted data to the Google Sheet
        sheet.appendRow([ticketDetail, date, venue, location, "Ticketmaster", buyPrice, orderNumber, currentDate, email, "", paymentMethod]);

        // Get the last row number and apply the accounting format to the "buyPrice" in column F
        var lastRowNumber = sheet.getLastRow();
        sheet.getRange(lastRowNumber, 6).setNumberFormat('[$$-en-US]#,##0.00_);([$$-en-US]#,##0.00)');
        GmailApp.markThreadsRead(unreadEmails); // Mark email as read
      } else {
        // The subject does not match the pattern
        // Your alternative code here
        GmailApp.markThreadsRead(unreadEmails); // Mark email as read
      }
    }
  }
  
  
}
