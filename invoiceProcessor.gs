function markAsReadversionthree() {
  var unreadEmails = GmailApp.search('is:unread');
  var dateObj = new Date();
  var month = String(dateObj.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-based
  var day = String(dateObj.getDate()).padStart(2, '0');
  var year = String(dateObj.getFullYear()).substring(2);
  var currentDate = month + '/' + day + '/' + year;

  // Access the Google Sheet
  var sheet = SpreadsheetApp.openById('YOUR_SHEET_URL_ID_HERE').getSheetByName('YOUR_SHEET_NAME_HERE'); // https://docs.google.com/spreadsheets/d/YOUR_SHEET_URL_ID_HERE/edit#gid=0

  for (var i = 0; i < unreadEmails.length; i++) {
    var messages = unreadEmails[i].getMessages();
    var pattern = /You Got Tickets To \b/;

    for (var j = 0; j < messages.length; j++) {
      var emailSubject = messages[j].getSubject();
      // Get the email address the email was sent to
      var email = messages[j].getTo().replace(/<|>/g, '');

      if (pattern.test(emailSubject) && messages[j].isUnread()) {
        var bodyPlainText = messages[j].getBody();
        Logger.log(bodyPlainText);
        // Extract Ticket Name
        var subjectPattern = /You Got Tickets To (.*)/;
        var subjectMatch = emailSubject.match(subjectPattern);
        var ticketDetail = subjectMatch ? subjectMatch[1] : "";

        // Extract Buy Price
        var buyPricePattern = /\$([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})/;
        var buyPriceMatch = bodyPlainText.match(buyPricePattern);
        var buyPrice = buyPriceMatch ? buyPriceMatch[1] : "";

        // Extract Order Number
        var orderPattern = /Order # (\d+-\d+\/[A-Za-z\d]+)/; 
        var orderNumberMatch = bodyPlainText.match(orderPattern);
        var orderNumber = orderNumberMatch ? orderNumberMatch[1] : "";

        // Extract Date
        var datePattern = /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun) · ([A-Za-z]{3} \d{1,2}, \d{4}) ·/;
        var dateMatch = bodyPlainText.match(datePattern);
        var originalDate = dateMatch ? dateMatch[2] : "";
        
        // Convert date to MM/DD/YY format
        if (originalDate) {
          var dateParts = originalDate.split(' ');
          var monthNames = {
            Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
            Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
          };
          var convertedMonth = monthNames[dateParts[0]];
          var convertedDay = String(dateParts[1].replace(',', '')).padStart(2, '0');
          var convertedYear = dateParts[2].substring(2);
          var formattedDate = convertedMonth + '/' + convertedDay + '/' + convertedYear;
        }

        // Extract Venue
        var venuePattern = /<td[^>]*class="full-width"[^>]*>([^<]+) &mdash;/;
        var venueMatch = bodyPlainText.match(venuePattern);
        var venue = venueMatch ? venueMatch[1].trim() : "";

        // Extract Location
        var locationPattern = /&mdash; ([\w\s,]+)<\/td>/;
        var locationMatch = bodyPlainText.match(locationPattern);
        var location = locationMatch ? locationMatch[1].trim() : "";

        // Extract Payment Method
        var paymentMethodPattern = /<td[^>]*>([^&]+) &mdash; \d{4}<\/td>/;
        var paymentMethodMatch = bodyPlainText.match(paymentMethodPattern);
        var paymentMethod = paymentMethodMatch ? paymentMethodMatch[1].trim() : "";

        // Extract Payment Digits
        var paymentMethodDigitsPattern = /<td[^>]*>[^&]+ &mdash; (\d{4})<\/td>/;
        var paymentMethodDigitsMatch = bodyPlainText.match(paymentMethodDigitsPattern);
        var paymentMethodDigits = paymentMethodDigitsMatch ? paymentMethodDigitsMatch[1].trim() : "";

        // Append the extracted data to the Google Sheet
        sheet.appendRow([ticketDetail, formattedDate, venue, location, "Ticketmaster", buyPrice, orderNumber, currentDate, email, "", paymentMethod, "'"+paymentMethodDigits]);

        // Get the last row number and apply the accounting format to the "buyPrice" in column F
        var lastRowNumber = sheet.getLastRow();
        sheet.getRange(lastRowNumber, 6).setNumberFormat('[$$-en-US]#,##0.00_);([$$-en-US]#,##0.00)');
        
        // Mark the message as read
        messages[j].markRead();
      }
    }
  }
}
