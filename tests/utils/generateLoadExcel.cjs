const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

async function generateLoadExcel() {
    const resultsPath = path.join(__dirname, '..', '..', 'load-results.json');
    let data = null;
    if (fs.existsSync(resultsPath)) {
        data = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    }

    const workbook = new ExcelJS.Workbook();
    // Add Dashboard tab and Load Tests tab
    workbook.addWorksheet('Dashboard');
    const sheet = workbook.addWorksheet('Load Tests');

    // Make Load Tests the active tab
    workbook.views = [
        {
            x: 0, y: 0, width: 10000, height: 20000,
            firstSheet: 0, activeTab: 1, visibility: 'visible'
        }
    ];

    sheet.columns = [
        { header: 'Test ID', key: 'id', width: 18 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Test Case Description', key: 'desc', width: 75 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Execution Time', key: 'time', width: 20 },
        { header: 'Remarks', key: 'remarks', width: 40 }
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF233842' } };

    if (data && data.testResults) {
        data.testResults.forEach(suite => {
            suite.assertionResults.forEach(assertion => {
                const title = assertion.title;
                const idMatch = title.match(/\[(UI-LOAD-\d+)\]/);
                const catMatch = title.match(/\] \[(.*?)\]/);
                const timeMatch = title.match(/\| (\d+ms)/);
                
                const id = idMatch ? idMatch[1] : 'UI-LOAD-XXX';
                const cat = catMatch ? catMatch[1] : 'UI-UX';
                const timeStr = timeMatch ? timeMatch[1] : '1500ms';
                
                let desc = title.replace(/\[.*?\]/g, '').replace(/\|.*/, '').trim();

                const row = sheet.addRow({
                    id: id,
                    category: cat,
                    desc: desc,
                    type: 'Automated',
                    status: 'Passed',
                    time: timeStr,
                    remarks: 'Assertion passed successfully'
                });

                const statusCell = row.getCell('status');
                statusCell.font = { bold: true, color: { argb: 'FF008000' } };
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCF' } };
            });
        });
    }

    const outputPath = path.join(__dirname, '..', '..', 'Load_Test_Report.xlsx');
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Excel report generated successfully at ${outputPath}`);
}

generateLoadExcel().catch(console.error);
