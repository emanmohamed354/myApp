// utils/dataExport.js
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export class DataExportManager {
  static async exportCarData(carData, sensorHistory) {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        carInfo: carData,
        sensorHistory: sensorHistory,
      };

      const fileName = `car_data_export_${Date.now()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(exportData, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 }
      );

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Car Data',
      });

      return true;
    } catch (error) {
      console.error('Error exporting data:', error);
      return false;
    }
  }

  static async importCarData() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        const content = await FileSystem.readAsStringAsync(result.uri);
        const importedData = JSON.parse(content);
        
        // Validate imported data
        if (!importedData.carInfo || !importedData.appVersion) {
          throw new Error('Invalid data format');
        }

        return importedData;
      }
      
      return null;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  static async generateReport(carData, healthHistory) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Vehicle Health Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #3B82F6; }
            .section { margin: 20px 0; }
            .metric { display: flex; justify-content: space-between; padding: 10px; background: #f5f5f5; margin: 5px 0; }
            .health-score { font-size: 48px; color: #10B981; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Vehicle Health Report</h1>
          <div class="section">
            <h2>Vehicle Information</h2>
            <div class="metric">
              <span>Make/Model:</span>
              <strong>${carData.make} ${carData.model}</strong>
            </div>
            <div class="metric">
              <span>Year:</span>
              <strong>${carData.year}</strong>
            </div>
            <div class="metric">
              <span>VIN:</span>
              <strong>${carData.vin}</strong>
            </div>
          </div>
          
          <div class="section">
            <h2>Current Health Score</h2>
            <div class="health-score">${healthHistory[0]?.score || 'N/A'}%</div>
          </div>
          
          <div class="section">
            <h2>Report Generated</h2>
            <p>${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    const fileName = `vehicle_report_${Date.now()}.html`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, html);
    await Sharing.shareAsync(fileUri);
  }
}