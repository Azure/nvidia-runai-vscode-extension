import * as vscode from 'vscode';
import { RunAIClient, Cluster } from '../api/client';

class ConfigureTreeItem extends vscode.TreeItem {
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

export class ClustersProvider implements vscode.TreeDataProvider<ClusterTreeItem | ConfigureTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ClusterTreeItem | ConfigureTreeItem | undefined | null | void> = new vscode.EventEmitter<ClusterTreeItem | ConfigureTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ClusterTreeItem | ConfigureTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private client: RunAIClient | undefined) {}

    updateClient(client: RunAIClient): void {
        this.client = client;
        this.refresh();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ClusterTreeItem | ConfigureTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ClusterTreeItem | ConfigureTreeItem): Promise<(ClusterTreeItem | ConfigureTreeItem)[]> {
        if (!this.client) {
            return [new ConfigureTreeItem()];
        }

        if (!element) {
            try {
                const clusters = await this.client.getClusters();
                return clusters.map(c => new ClusterTreeItem(c));
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to fetch clusters: ${error}`);
                return [new ConfigureTreeItem()];
            }
        }
        return [];
    }
}

export class ClusterTreeItem extends vscode.TreeItem {
    constructor(public readonly cluster: Cluster) {
        super(cluster.name, vscode.TreeItemCollapsibleState.None);
        
        this.tooltip = `${cluster.name}\nURL: ${cluster.url}`;
        this.description = cluster.url;
        this.iconPath = new vscode.ThemeIcon('server');
        this.contextValue = 'cluster';
    }
}
