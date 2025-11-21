import { toast } from 'react-toastify';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

export const fileService = {
  // Get all files for a specific task
  async getByTaskId(taskId) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "file_name_c"}},
          {"field": {"Name": "file_data_c"}},
          {"field": {"Name": "task_c"}}
        ],
        where: [{
          "FieldName": "task_c",
          "Operator": "EqualTo",
          "Values": [parseInt(taskId)],
          "Include": true
        }]
      };
      
      const response = await apperClient.fetchRecords('files_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      // Transform the data to match UI expectations
      return response.data.map(file => ({
        Id: file.Id,
        name: file.Name || file.file_name_c,
        fileName: file.file_name_c,
        fileData: file.file_data_c,
        taskId: file.task_c?.Id || file.task_c
      }));
    } catch (error) {
      console.error("Error fetching files for task:", error?.response?.data?.message || error);
      return [];
    }
  },

  // Create new files for a task
  async createFiles(taskId, files) {
    try {
      if (!files || files.length === 0) {
        return [];
      }

      const apperClient = getApperClient();
      
      const records = files.map(file => ({
        Name: file.name || file.fileName,
        file_name_c: file.name || file.fileName,
        file_data_c: file.fileData || file.file_data_c,
        task_c: parseInt(taskId)
      }));

      const params = {
        records: records
      };

      const response = await apperClient.createRecord('files_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} files: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        return successful.map(r => ({
          Id: r.data.Id,
          name: r.data.Name || r.data.file_name_c,
          fileName: r.data.file_name_c,
          fileData: r.data.file_data_c,
          taskId: r.data.task_c
        }));
      }

      return [];
    } catch (error) {
      console.error("Error creating files:", error?.response?.data?.message || error);
      return [];
    }
  },

  // Delete a file by ID
  async deleteFile(fileId) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        RecordIds: [parseInt(fileId)]
      };

      const response = await apperClient.deleteRecord('files_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} files: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length === 1;
      }

      return false;
    } catch (error) {
      console.error("Error deleting file:", error?.response?.data?.message || error);
      return false;
    }
  },

  // Get file download URL (if needed for direct download)
  getFileUrl(fileData) {
    if (!fileData || !Array.isArray(fileData) || fileData.length === 0) {
      return null;
    }
    
    // Return the URL from the file data array
    return fileData[0]?.url || null;
  },

  // Helper to get files using ApperFileUploader SDK
  async getFilesFromUploader(fieldKey) {
    try {
      if (!window.ApperSDK) {
        throw new Error('ApperSDK not available');
      }
      
      const { ApperFileUploader } = window.ApperSDK;
      const files = ApperFileUploader.FileField.getFiles(fieldKey);
      
      return files || [];
    } catch (error) {
      console.error("Error getting files from uploader:", error);
      return [];
    }
  }
};

export default fileService;