import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PublerApi implements ICredentialType {
	name = 'publerApi';
	displayName = 'Publer API';
	documentationUrl = 'https://publer.com/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Your Publer API token',
		},
		{
			displayName: 'Workspace ID',
			name: 'workspaceId',
			type: 'string',
			default: '',
			description: 'Optional: Required for some API endpoints. Found in Publer URL or settings.',
		},
	];
	authenticate = {
		type: 'generic' as const,
		properties: {
			headers: {
				Authorization: '=Bearer-API {{$credentials.apiToken}}',
				'Publer-Workspace-Id': '={{$credentials.workspaceId}}',
			},
		},
	};
}
