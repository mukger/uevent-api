const QRCode = require('qrcode');
const { jsPDF } = require("jspdf");

class PdfService {
    async createPdf(data) {
        let qrCode = await QRCode.toDataURL(data.ticketId);

        if(!data.discount) {
            data.discount = '-';
        }

        console.log(data);

        const pdf = new jsPDF({
            orientation: "portrait", // should it be portrait or landscape?
            unit: "cm", // unit of measure while adding stuff
            format: "a4", // format can be string or array [x, y] in above units
        });

        // Inserting text
        pdf.setTextColor(114, 213, 231);
        pdf.setFontSize(50);
        pdf.text("Ticket", 1.5, 3.5);

        // Inserting qrCode
        pdf.addImage(qrCode, "JPEG", 14, 1, 5, 5);

        // Adding lines
        pdf.setLineWidth(0.05);
        pdf.line(9, 7, 9, 27);
        pdf.line(1, 12, 20, 12);
        pdf.line(1, 16, 20, 16);
        pdf.line(1, 20, 20, 20);
        pdf.line(1, 24, 20, 24);

        // Adding information
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(25);
        pdf.text("Person", 2, 10);
        pdf.setFontSize(18);
        pdf.text(data.user, 2, 11);
    
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(25);
        pdf.text("Order Date", 12, 10);
        pdf.setFontSize(18);
        pdf.text(data.date.toISOString(), 12, 11);
    
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(25);
        pdf.text("Event Name", 2, 14);
        pdf.setFontSize(18);
        pdf.text(data.eventName, 2, 15);
    
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(25);
        pdf.text("Execution Date", 12, 14);
        pdf.setFontSize(18);
        pdf.text(data.executionDate.toISOString(), 12, 15);
    
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(25);
        pdf.text("Company Name", 2, 18);
        pdf.setFontSize(18);
        pdf.text(data.companyName, 2, 19);
    
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(25);
        pdf.text("Ticket Price", 12, 18);
        pdf.setFontSize(18);
        pdf.text(data.ticketPrice.toString(), 12, 19);
    
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(25);
        pdf.text("Discount", 2, 22);
        pdf.setFontSize(18);
        pdf.text(data.discount.toString(), 2, 23);
    
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(25);
        pdf.text("Total Ticket Price", 12, 22);
        pdf.setFontSize(18);
        pdf.text(data.totalTicketPrice.toString(), 12, 23);

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(25);
        pdf.text("Place", 2, 26);
        pdf.setFontSize(18);
        pdf.text(data.place, 2, 27);

        return pdf.output("datauristring");
    }
}

module.exports = new PdfService();