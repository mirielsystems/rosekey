/// <reference path="attachment.ts" />
/// <reference path="status_params.ts" />
namespace Entity {
	export type ScheduledStatus = {
		id: string;
		scheduled_at: string;
		params: StatusParams;
		media_attachments: Array<Attachment>;
	};
}
