import { toast } from "react-toastify";
import React from "react";
import { getApperClient } from "@/services/apperClient";

const tableName = "task_c";

export const taskService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return [];
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
{"field": {"Name": "status_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "completed_at_c"}}
        ],
        orderBy: [{
          "fieldName": "created_at_c", 
          "sorttype": "DESC"
        }]
      };

      const response = await apperClient.fetchRecords(tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      // Transform data to match existing UI expectations
      return response.data.map(task => ({
        ...task,
        title: task.title_c || task.Name || '',
        description: task.description_c || '',
        priority: task.priority_c || 'medium',
        status: task.status_c || 'active',
        createdAt: task.created_at_c || task.CreatedOn,
        completedAt: task.completed_at_c
      }));

    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return null;
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
{"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "completed_at_c"}}
        ]
      };
      const response = await apperClient.getRecordById(tableName, parseInt(id), params);

      if (!response?.data) {
        return null;
      }

      // Transform data to match existing UI expectations
      const task = response.data;
      return {
        ...task,
        title: task.title_c || task.Name || '',
        description: task.description_c || '',
        priority: task.priority_c || 'medium',
        status: task.status_c || 'active',
        createdAt: task.created_at_c || task.CreatedOn,
        completedAt: task.completed_at_c
      };

    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("Service not available");
      }

      const params = {
        records: [
          {
Name: taskData.title || taskData.title_c || '',
            title_c: taskData.title || taskData.title_c || '',
            description_c: taskData.description || taskData.description_c || '',
            priority_c: taskData.priority || taskData.priority_c || 'medium',
            status_c: taskData.status || taskData.status_c || 'active',
            created_at_c: new Date().toISOString()
          }
        ]
      };

      const response = await apperClient.createRecord(tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
const createdTask = successful[0].data;
          return {
            ...createdTask,
            title: createdTask.title_c || createdTask.Name || '',
            description: createdTask.description_c || '',
            priority: createdTask.priority_c || 'medium',
            status: createdTask.status_c || 'active',
            createdAt: createdTask.created_at_c,
            completedAt: createdTask.completed_at_c
          };
        }
      }

      throw new Error("Failed to create task");

    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("Service not available");
      }

      const updateData = {
        Id: parseInt(id)
      };

      // Map UI field names to database field names
      if (updates.title !== undefined) updateData.title_c = updates.title;
if (updates.description !== undefined) updateData.description_c = updates.description;
      if (updates.priority !== undefined) updateData.priority_c = updates.priority;
      if (updates.status !== undefined) updateData.status_c = updates.status;
      if (updates.completedAt !== undefined) updateData.completed_at_c = updates.completedAt;
      if (updates.Tags !== undefined) updateData.Tags = updates.Tags;

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord(tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
const updatedTask = successful[0].data;
          return {
            ...updatedTask,
            title: updatedTask.title_c || updatedTask.Name || '',
            description: updatedTask.description_c || '',
            priority: updatedTask.priority_c || 'medium',
            status: updatedTask.status_c || 'active',
            createdAt: updatedTask.created_at_c,
            completedAt: updatedTask.completed_at_c
          };
        }
      }

      throw new Error("Failed to update task");

    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("Service not available");
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }

        return successful.length > 0;
      }

      return false;

    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error);
      throw error;
    }
  }
};