import * as vscode from 'vscode';
import { RunAIClient } from './api/client';
import { WorkloadsProvider } from './providers/workloadsProvider';
import { ProjectsProvider } from './providers/projectsProvider';
import { ClustersProvider } from './providers/clustersProvider';

let client: RunAIClient | undefined;
let workloadsProvider: WorkloadsProvider;
let projectsProvider: ProjectsProvider;
let clustersProvider: ClustersProvider;

async function initializeProviders(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('runai');
    const apiUrl = config.get<string>('apiUrl');
    const token = config.get<string>('token');

    if (apiUrl) {
        client = new RunAIClient({ apiUrl, token });
        workloadsProvider = new WorkloadsProvider(client);
        projectsProvider = new ProjectsProvider(client);
        clustersProvider = new ClustersProvider(client);
    } else {
        workloadsProvider = new WorkloadsProvider(undefined);
        projectsProvider = new ProjectsProvider(undefined);
        clustersProvider = new ClustersProvider(undefined);
    }

    vscode.window.registerTreeDataProvider('runaiWorkloads', workloadsProvider);
    vscode.window.registerTreeDataProvider('runaiProjects', projectsProvider);
    vscode.window.registerTreeDataProvider('runaiClusters', clustersProvider);
}

async function showGettingStartedWizard() {
    const result = await vscode.window.showInformationMessage(
        'Welcome to Run:AI! Would you like to configure your API connection now?',
        'Configure Now',
        'Configure Later'
    );

    if (result === 'Configure Now') {
        await vscode.commands.executeCommand('run-ai.configure');
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Run:AI extension is now active!');

    const config = vscode.workspace.getConfiguration('runai');
    const hasConfigured = config.get<string>('apiUrl');

    initializeProviders(context);

    if (!hasConfigured) {
        showGettingStartedWizard();
    }

    context.subscriptions.push(
        vscode.commands.registerCommand('run-ai.configure', async () => {
            const currentConfig = vscode.workspace.getConfiguration('runai');
            const apiUrl = await vscode.window.showInputBox({
                prompt: 'Enter Run:AI API URL',
                placeHolder: 'https://app.run.ai',
                value: currentConfig.get<string>('apiUrl')
            });

            if (apiUrl) {
                await currentConfig.update('apiUrl', apiUrl, vscode.ConfigurationTarget.Global);

                const token = await vscode.window.showInputBox({
                    prompt: 'Enter Run:AI API Token (optional)',
                    password: true,
                    value: currentConfig.get<string>('token')
                });

                if (token) {
                    await currentConfig.update('token', token, vscode.ConfigurationTarget.Global);
                }

                client = new RunAIClient({ apiUrl, token });
                workloadsProvider.updateClient(client);
                projectsProvider.updateClient(client);
                clustersProvider.updateClient(client);

                workloadsProvider.refresh();
                projectsProvider.refresh();
                clustersProvider.refresh();

                vscode.window.showInformationMessage('Run:AI configuration updated successfully!');
            }
        }),

        vscode.commands.registerCommand('run-ai.refreshWorkloads', () => {
            if (workloadsProvider) {
                workloadsProvider.refresh();
                vscode.window.showInformationMessage('Workloads refreshed');
            }
        }),

        vscode.commands.registerCommand('run-ai.refreshProjects', () => {
            if (projectsProvider) {
                projectsProvider.refresh();
                vscode.window.showInformationMessage('Projects refreshed');
            }
        }),

        vscode.commands.registerCommand('run-ai.refreshClusters', () => {
            if (clustersProvider) {
                clustersProvider.refresh();
                vscode.window.showInformationMessage('Clusters refreshed');
            }
        }),

        vscode.commands.registerCommand('run-ai.showWorkloadDetails', async (workload) => {
            const panel = vscode.window.createWebviewPanel(
                'workloadDetails',
                `Workload: ${workload.name}`,
                vscode.ViewColumn.One,
                {}
            );

            const gpu = workload.allocatedResources?.gpu || 'N/A';
            const cpu = workload.allocatedResources?.cpu || 'N/A';
            const gpuMemory = workload.allocatedResources?.gpuMemory || 'N/A';
            const cpuMemory = workload.allocatedResources?.cpuMemory || 'N/A';

            panel.webview.html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { 
                            font-family: var(--vscode-font-family);
                            padding: 20px;
                            color: var(--vscode-foreground);
                        }
                        h1 { color: var(--vscode-foreground); }
                        .detail { margin: 10px 0; }
                        .label { 
                            font-weight: bold; 
                            display: inline-block;
                            width: 150px;
                        }
                        .status-running { color: #4CAF50; }
                        .status-pending { color: #FFC107; }
                        .status-failed { color: #F44336; }
                        .status-succeeded { color: #4CAF50; }
                    </style>
                </head>
                <body>
                    <h1>${workload.name}</h1>
                    <div class="detail">
                        <span class="label">Status:</span>
                        <span class="status-${workload.phase.toLowerCase()}">${workload.phase}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Type:</span>
                        <span>${workload.type}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Project:</span>
                        <span>${workload.projectName}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Project ID:</span>
                        <span>${workload.projectId}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Created:</span>
                        <span>${new Date(workload.createdAt).toLocaleString()}</span>
                    </div>
                    <h2>Resources</h2>
                    <div class="detail">
                        <span class="label">GPU:</span>
                        <span>${gpu}</span>
                    </div>
                    <div class="detail">
                        <span class="label">CPU:</span>
                        <span>${cpu}</span>
                    </div>
                    <div class="detail">
                        <span class="label">GPU Memory:</span>
                        <span>${gpuMemory}</span>
                    </div>
                    <div class="detail">
                        <span class="label">CPU Memory:</span>
                        <span>${cpuMemory}</span>
                    </div>
                </body>
                </html>
            `;
        }),

        vscode.commands.registerCommand('run-ai.deleteWorkload', async (item) => {
            if (!client) {
                vscode.window.showErrorMessage('Run:AI client not initialized');
                return;
            }

            const confirm = await vscode.window.showWarningMessage(
                `Delete workload "${item.workload.name}"?`,
                { modal: true },
                'Delete'
            );

            if (confirm === 'Delete') {
                try {
                    await client.deleteWorkload(item.workload.id);
                    vscode.window.showInformationMessage(`Workload "${item.workload.name}" deleted`);
                    workloadsProvider.refresh();
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to delete workload: ${error}`);
                }
            }
        }),

        vscode.commands.registerCommand('run-ai.submitWorkspace', async () => {
            if (!client) {
                const result = await vscode.window.showInformationMessage(
                    'Run:AI is not configured. Would you like to configure it now?',
                    'Configure',
                    'Cancel'
                );
                if (result === 'Configure') {
                    await vscode.commands.executeCommand('run-ai.configure');
                }
                return;
            }

            try {
                const projects = await client.getProjects();
                const projectNames = projects.map(p => ({ label: p.name, id: p.id }));

                const selectedProject = await vscode.window.showQuickPick(projectNames, {
                    placeHolder: 'Select a project'
                });

                if (!selectedProject) {return;}

                const name = await vscode.window.showInputBox({
                    prompt: 'Enter workspace name',
                    placeHolder: 'my-workspace'
                });

                if (!name) {return;}

                const image = await vscode.window.showInputBox({
                    prompt: 'Enter Docker image',
                    placeHolder: 'ubuntu:latest'
                });

                if (!image) {return;}

                const gpuInput = await vscode.window.showInputBox({
                    prompt: 'Enter number of GPUs (optional)',
                    placeHolder: '1'
                });

                const gpu = gpuInput ? parseInt(gpuInput) : undefined;

                await client.submitWorkspace(selectedProject.id, name, image, gpu);
                vscode.window.showInformationMessage(`Workspace "${name}" submitted!`);
                workloadsProvider.refresh();
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to submit workspace: ${error}`);
            }
        }),

        vscode.commands.registerCommand('run-ai.submitTraining', async () => {
            if (!client) {
                const result = await vscode.window.showInformationMessage(
                    'Run:AI is not configured. Would you like to configure it now?',
                    'Configure',
                    'Cancel'
                );
                if (result === 'Configure') {
                    await vscode.commands.executeCommand('run-ai.configure');
                }
                return;
            }

            try {
                const projects = await client.getProjects();
                const projectNames = projects.map(p => ({ label: p.name, id: p.id }));

                const selectedProject = await vscode.window.showQuickPick(projectNames, {
                    placeHolder: 'Select a project'
                });

                if (!selectedProject) {return;}

                const name = await vscode.window.showInputBox({
                    prompt: 'Enter training job name',
                    placeHolder: 'my-training-job'
                });

                if (!name) {return;}

                const image = await vscode.window.showInputBox({
                    prompt: 'Enter Docker image',
                    placeHolder: 'pytorch/pytorch:latest'
                });

                if (!image) {return;}

                const command = await vscode.window.showInputBox({
                    prompt: 'Enter command (optional)',
                    placeHolder: 'python train.py'
                });

                const gpuInput = await vscode.window.showInputBox({
                    prompt: 'Enter number of GPUs (optional)',
                    placeHolder: '1'
                });

                const gpu = gpuInput ? parseInt(gpuInput) : undefined;

                await client.submitTraining(selectedProject.id, name, image, command, gpu);
                vscode.window.showInformationMessage(`Training job "${name}" submitted!`);
                workloadsProvider.refresh();
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to submit training job: ${error}`);
            }
        }),

        vscode.commands.registerCommand('run-ai.listWorkloads', async () => {
            if (!client) {
                vscode.window.showErrorMessage('Run:AI client not initialized');
                return;
            }

            try {
                const workloads = await client.getWorkloads();
                const items = workloads.map(w => ({
                    label: w.name,
                    description: `${w.phase} - ${w.projectName}`,
                    detail: `Created: ${new Date(w.createdAt).toLocaleString()}`
                }));

                await vscode.window.showQuickPick(items, {
                    placeHolder: 'Select a workload to view details'
                });
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to list workloads: ${error}`);
            }
        })
    );
}

export function deactivate() {}
