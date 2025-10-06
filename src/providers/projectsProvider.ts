import * as vscode from 'vscode';
import { RunAIClient, Project } from '../api/client';

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

export class ProjectsProvider implements vscode.TreeDataProvider<ProjectTreeItem | ConfigureTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ProjectTreeItem | ConfigureTreeItem | undefined | null | void> = new vscode.EventEmitter<ProjectTreeItem | ConfigureTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ProjectTreeItem | ConfigureTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private client: RunAIClient | undefined) {}

    updateClient(client: RunAIClient): void {
        this.client = client;
        this.refresh();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ProjectTreeItem | ConfigureTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ProjectTreeItem | ConfigureTreeItem): Promise<(ProjectTreeItem | ConfigureTreeItem)[]> {
        if (!this.client) {
            return [new ConfigureTreeItem()];
        }

        if (!element) {
            try {
                const projects = await this.client.getProjects();
                return projects.map(p => new ProjectTreeItem(p));
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to fetch projects: ${error}`);
                return [new ConfigureTreeItem()];
            }
        }
        return [];
    }
}

export class ProjectTreeItem extends vscode.TreeItem {
    constructor(public readonly project: Project) {
        super(project.name, vscode.TreeItemCollapsibleState.None);
        
        this.tooltip = `${project.name}\nDepartment: ${project.departmentName}`;
        this.description = project.departmentName;
        this.iconPath = new vscode.ThemeIcon('folder');
        this.contextValue = 'project';
    }
}
