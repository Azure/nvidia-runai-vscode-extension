import * as vscode from 'vscode';
import { RunAIClient, Workload } from '../api/client';

export class WorkloadsProvider implements vscode.TreeDataProvider<WorkloadTreeItem | ConfigureTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<WorkloadTreeItem | ConfigureTreeItem | undefined | null | void> = new vscode.EventEmitter<WorkloadTreeItem | ConfigureTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<WorkloadTreeItem | ConfigureTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private client: RunAIClient | undefined) {}

    updateClient(client: RunAIClient): void {
        this.client = client;
        this.refresh();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: WorkloadTreeItem | ConfigureTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: WorkloadTreeItem | ConfigureTreeItem): Promise<(WorkloadTreeItem | ConfigureTreeItem)[]> {
        if (!this.client) {
            return [new ConfigureTreeItem()];
        }

        if (!element) {
            try {
                const workloads = await this.client.getWorkloads();
                if (workloads.length === 0) {
                    return [new EmptyStateTreeItem('No workloads found. Click + to create one.')];
                }
                return workloads.map(w => new WorkloadTreeItem(w));
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to fetch workloads: ${error}`);
                return [new ConfigureTreeItem()];
            }
        }
        return [];
    }
}

export class ConfigureTreeItem extends vscode.TreeItem {
    constructor() {
        super('Click here to configure Run:AI', vscode.TreeItemCollapsibleState.None);
        this.iconPath = new vscode.ThemeIcon('gear');
        this.command = {
            command: 'run-ai.configure',
            title: 'Configure Run:AI'
        };
        this.contextValue = 'configure';
    }
}

export class EmptyStateTreeItem extends vscode.TreeItem {
    constructor(message: string) {
        super(message, vscode.TreeItemCollapsibleState.None);
        this.iconPath = new vscode.ThemeIcon('info');
        this.contextValue = 'empty';
    }
}

export class WorkloadTreeItem extends vscode.TreeItem {
    constructor(public readonly workload: Workload) {
        super(workload.name, vscode.TreeItemCollapsibleState.None);
        
        this.tooltip = `${workload.name}\nStatus: ${workload.phase}\nProject: ${workload.projectName}`;
        this.description = `${workload.phase} - ${workload.projectName}`;
        
        this.iconPath = this.getIconForPhase(workload.phase);
        
        this.contextValue = 'workload';
        this.command = {
            command: 'run-ai.showWorkloadDetails',
            title: 'Show Workload Details',
            arguments: [workload]
        };
    }

    private getIconForPhase(phase: string): vscode.ThemeIcon {
        switch (phase.toLowerCase()) {
            case 'running':
                return new vscode.ThemeIcon('play', new vscode.ThemeColor('terminal.ansiGreen'));
            case 'pending':
                return new vscode.ThemeIcon('clock', new vscode.ThemeColor('terminal.ansiYellow'));
            case 'failed':
                return new vscode.ThemeIcon('error', new vscode.ThemeColor('terminal.ansiRed'));
            case 'succeeded':
            case 'completed':
                return new vscode.ThemeIcon('check', new vscode.ThemeColor('terminal.ansiGreen'));
            default:
                return new vscode.ThemeIcon('circle-outline');
        }
    }
}
