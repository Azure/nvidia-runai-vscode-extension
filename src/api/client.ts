import axios, { AxiosInstance } from 'axios';

export interface RunAIConfig {
    apiUrl: string;
    token?: string;
}

export interface Workload {
    id: string;
    name: string;
    type: string;
    phase: string;
    projectName: string;
    projectId: string;
    clusterI: string;
    createdAt: string;
    allocatedResources?: {
        gpu?: number;
        cpu?: number;
        cpuMemory?: string;
        gpuMemory?: string;
    };
}

export interface Project {
    id: string;
    name: string;
    departmentId: string;
    departmentName: string;
    clusterId: string;
}

export interface Cluster {
    id: string;
    name: string;
    url: string;
}

export class RunAIClient {
    private client: AxiosInstance;

    constructor(config: RunAIConfig) {
        this.client = axios.create({
            baseURL: config.apiUrl,
            headers: config.token ? {
                'Authorization': `Bearer ${config.token}`
            } : {}
        });
    }

    async getWorkloads(projectId?: string): Promise<Workload[]> {
        const params: any = {};
        if (projectId) {
            params.filterBy = `projectId==${projectId}`;
        }
        const response = await this.client.get('/api/v1/workloads', { params });
        return response.data.workloads || [];
    }

    async getWorkload(workloadId: string): Promise<Workload> {
        const response = await this.client.get(`/api/v1/workloads/${workloadId}`);
        return response.data;
    }

    async deleteWorkload(workloadId: string): Promise<void> {
        await this.client.delete(`/api/v1/workloads/${workloadId}`);
    }

    async getProjects(): Promise<Project[]> {
        const response = await this.client.get('/api/v1/projects');
        return response.data.projects || [];
    }

    async getClusters(): Promise<Cluster[]> {
        const response = await this.client.get('/api/v1/clusters');
        return response.data.clusters || [];
    }

    async submitWorkspace(projectId: string, name: string, image: string, gpu?: number): Promise<any> {
        const payload: any = {
            name,
            projectId,
            spec: {
                image,
                compute: {}
            }
        };
        
        if (gpu) {
            payload.spec.compute.gpuDevicesRequest = gpu;
        }

        const response = await this.client.post('/api/v1/workloads/workspaces', payload);
        return response.data;
    }

    async submitTraining(projectId: string, name: string, image: string, command?: string, gpu?: number): Promise<any> {
        const payload: any = {
            name,
            projectId,
            spec: {
                image,
                compute: {},
                command: command || ''
            }
        };
        
        if (gpu) {
            payload.spec.compute.gpuDevicesRequest = gpu;
        }

        const response = await this.client.post('/api/v1/workloads/trainings', payload);
        return response.data;
    }
}
