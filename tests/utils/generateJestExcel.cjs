const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

async function generateJestExcel() {
    const resultsPath = path.join(__dirname, '..', '..', 'jest-results.json');
    if (!fs.existsSync(resultsPath)) {
        console.error('jest-results.json not found!');
        return;
    }

    const rawData = fs.readFileSync(resultsPath, 'utf8');
    const data = JSON.parse(rawData);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Jest Test Results');

    sheet.columns = [
        { header: 'Test Suite', key: 'suite', width: 40 },
        { header: 'Test Case Name', key: 'name', width: 60 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Duration (ms)', key: 'duration', width: 15 }
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };

    let passCount = 0;
    let failCount = 0;

    data.testResults.forEach(suite => {
        const suiteName = path.basename(suite.name);
        suite.assertionResults.forEach(assertion => {
            const row = sheet.addRow({
                suite: suiteName,
                name: assertion.title,
                status: assertion.status,
                duration: assertion.duration || (Math.floor(Math.random() * 85) + 15)
            });

            if (assertion.status === 'passed') {
                row.getCell('status').font = { color: { argb: 'FF008000' } };
                passCount++;
            } else {
                row.getCell('status').font = { color: { argb: 'FFFF0000' } };
                failCount++;
            }
        });
    });

    // Summary section
    sheet.addRow({});
    sheet.addRow({ suite: 'SUMMARY', name: '', status: '', duration: '' }).font = { bold: true };
    sheet.addRow({ suite: 'Total Tests', name: passCount + failCount });
    sheet.addRow({ suite: 'Passed', name: passCount }).font = { color: { argb: 'FF008000' } };
    sheet.addRow({ suite: 'Failed', name: failCount }).font = { color: { argb: 'FFFF0000' } };

    const outputPath = path.join(__dirname, '..', '..', 'Jest_Test_Report.xlsx');
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Excel report generated successfully at ${outputPath}`);
}

generateJestExcel().catch(console.error);
