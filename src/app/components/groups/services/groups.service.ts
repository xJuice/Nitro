import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { IMessageEvent } from '../../../../client/core/communication/messages/IMessageEvent';
import { GroupBadgePartsEvent } from '../../../../client/nitro/communication/messages/incoming/group/GroupBadgePartsEvent';
import { GroupBuyDataEvent } from '../../../../client/nitro/communication/messages/incoming/group/GroupBuyDataEvent';
import { GroupConfirmMemberRemoveEvent } from '../../../../client/nitro/communication/messages/incoming/group/GroupConfirmMemberRemoveEvent';
import { GroupInformationEvent } from '../../../../client/nitro/communication/messages/incoming/group/GroupInformationEvent';
import { GroupMembersEvent } from '../../../../client/nitro/communication/messages/incoming/group/GroupMembersEvent';
import { RoomInfoEvent } from '../../../../client/nitro/communication/messages/incoming/room/data/RoomInfoEvent';
import { GroupAdminGiveComposer } from '../../../../client/nitro/communication/messages/outgoing/group/GroupAdminGiveComposer';
import { GroupAdminTakeComposer } from '../../../../client/nitro/communication/messages/outgoing/group/GroupAdminTakeComposer';
import { GroupBuyDataComposer } from '../../../../client/nitro/communication/messages/outgoing/group/GroupBuyDataComposer';
import { GroupConfirmRemoveMemberComposer } from '../../../../client/nitro/communication/messages/outgoing/group/GroupConfirmRemoveMemberComposer';
import { GroupDeleteComposer } from '../../../../client/nitro/communication/messages/outgoing/group/GroupDeleteComposer';
import { GroupInformationComposer } from '../../../../client/nitro/communication/messages/outgoing/group/GroupInformationComposer';
import { GroupJoinComposer } from '../../../../client/nitro/communication/messages/outgoing/group/GroupJoinComposer';
import { GroupMembersComposer } from '../../../../client/nitro/communication/messages/outgoing/group/GroupMembersComposer';
import { GroupMembershipAcceptComposer } from '../../../../client/nitro/communication/messages/outgoing/group/GroupMembershipAcceptComposer';
import { GroupMembershipDeclineComposer } from '../../../../client/nitro/communication/messages/outgoing/group/GroupMembershipDeclineComposer';
import { UserProfileComposer } from '../../../../client/nitro/communication/messages/outgoing/user/data/UserProfileComposer';
import { Nitro } from '../../../../client/nitro/Nitro';
import { RoomSessionEvent } from '../../../../client/nitro/session/events/RoomSessionEvent';
import { NotificationService } from '../../notification/services/notification.service';
import { GroupCreatorComponent } from '../components/group-creator/components/main/group-creator.component';
import { GroupInfoComponent } from '../components/group-info/group-info.component';
import { GroupMembersComponent } from '../components/group-members/group-members.component';
import { GroupRoomInfoComponent } from '../components/room-info/room-info.component';

@Injectable()
export class GroupsService implements OnDestroy
{
    private _messages: IMessageEvent[];

    private _roomInfoComponent: GroupRoomInfoComponent;
    private _groupInfoComponent: GroupInfoComponent;
    private _groupMembersComponent: GroupMembersComponent;

    private _groupCreatorModal: NgbModalRef;

    private _leavingGroupId: number;

    constructor(
        private _notificationService: NotificationService,
        private _modalService: NgbModal,
        private _ngZone: NgZone)
    {
        this._messages = [];

        this.onRoomSessionEvent = this.onRoomSessionEvent.bind(this);

        this.registerMessages();
    }

    public ngOnDestroy(): void
    {
        this.unregisterMessages();
    }

    private registerMessages(): void
    {
        this._ngZone.runOutsideAngular(() =>
        {
            this.unregisterMessages();

            Nitro.instance.roomSessionManager.events.addEventListener(RoomSessionEvent.ENDED, this.onRoomSessionEvent);

            this._messages = [
                new RoomInfoEvent(this.onRoomInfoEvent.bind(this)),
                new GroupInformationEvent(this.onGroupInformationEvent.bind(this)),
                new GroupMembersEvent(this.onGroupMembersEvent.bind(this)),
                new GroupConfirmMemberRemoveEvent(this.onGroupConfirmMemberRemoveEvent.bind(this)),
                new GroupBuyDataEvent(this.onGroupBuyDataEvent.bind(this)),
                new GroupBadgePartsEvent(this.onGroupBadgePartsEvent.bind(this))
            ];

            for(const message of this._messages) Nitro.instance.communication.registerMessageEvent(message);
        });
    }

    private unregisterMessages(): void
    {
        this._ngZone.runOutsideAngular(() =>
        {
            Nitro.instance.roomSessionManager.events.removeEventListener(RoomSessionEvent.ENDED, this.onRoomSessionEvent);

            if(this._messages && this._messages.length)
            {
                for(const message of this._messages) Nitro.instance.communication.removeMessageEvent(message);

                this._messages = [];
            }
        });
    }

    private onRoomSessionEvent(event: RoomSessionEvent): void
    {
        if(!event) return;

        switch(event.type)
        {
            case RoomSessionEvent.ENDED:
                this._ngZone.run(() =>
                {
                    this._roomInfoComponent.clear();
                });
                return;
        }
    }

    private onRoomInfoEvent(event: RoomInfoEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;
       
        this._ngZone.run(() => {
            this._roomInfoComponent.groupId          = parser.data.habboGroupId;
            this._roomInfoComponent.groupName        = parser.data.groupName;
            this._roomInfoComponent.groupBadgeCode   = parser.data.groupBadgeCode;
            this._roomInfoComponent.groupMember      = parser.isGroupMember;
        });

        Nitro.instance.communication.connection.send(new GroupInformationComposer(parser.data.habboGroupId, false));
    }

    private onGroupInformationEvent(event: GroupInformationEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        if(parser.flag || parser.id === this._groupInfoComponent.groupId)
        {
            this._ngZone.run(() => {
                this._groupInfoComponent.groupId                        = parser.id;
                this._groupInfoComponent.groupName                      = parser.title;
                this._groupInfoComponent.groupBadgeCode                 = parser.badge;
                this._groupInfoComponent.groupDescription               = parser.description;
                this._groupInfoComponent.groupType                      = parser.type;
                this._groupInfoComponent.groupMembershipType            = parser.membershipType;
                this._groupInfoComponent.groupCreationDate              = parser.createdAt;
                this._groupInfoComponent.groupOwnerName                 = parser.ownerName;
                this._groupInfoComponent.groupMembersCount              = parser.membersCount;
                this._groupInfoComponent.groupMembershipRequestsCount   = parser.pendingRequestsCount;
                this._groupInfoComponent.groupHomeRoomId                = parser.roomId;
            });
        }
        
        if(this._roomInfoComponent.groupId !== parser.id) return;

        this._ngZone.run(() =>
        {
            this._roomInfoComponent.groupType             = parser.type;
            this._roomInfoComponent.groupMembershipType   = parser.membershipType;
        });
    }

    private onGroupMembersEvent(event: GroupMembersEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        this._ngZone.run(() =>
        {
            this._groupMembersComponent.groupId             = parser.groupId;
            this._groupMembersComponent.groupName           = parser.groupTitle;
            this._groupMembersComponent.groupBadgeCode      = parser.badge;
            this._groupMembersComponent.totalMembersCount   = parser.totalMembersCount;
            this._groupMembersComponent.result              = parser.result;
            this._groupMembersComponent.admin               = parser.admin;
            this._groupMembersComponent.pageSize            = parser.pageSize;
            this._groupMembersComponent.pageIndex           = parser.pageIndex;
            this._groupMembersComponent.level               = parser.level.toString();
        });
    }

    private onGroupConfirmMemberRemoveEvent(event: GroupConfirmMemberRemoveEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        let confirmationConfig = [];

        if(parser.userId === Nitro.instance.sessionDataManager.userId)
        {
            confirmationConfig = this._groupInfoComponent.confirmLeave();
        }
        else
        {
            if(!this._groupMembersComponent.admin) return;

            confirmationConfig = this._groupMembersComponent.confirmRemove(parser.userId, parser.furnitureCount);
        }
        
        this._notificationService.alertWithChoices(confirmationConfig[1], confirmationConfig[2], confirmationConfig[0]);
    }

    private onGroupBuyDataEvent(event: GroupBuyDataEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        if(this._groupCreatorModal)
        {
            const instance = (this._groupCreatorModal.componentInstance as GroupCreatorComponent);

            if(instance)
            {
                this._ngZone.run(() => {
                    instance.groupCost      = parser.groupCost;
                    instance.availableRooms = parser.availableRooms;
                });
            }
        }
    }

    private onGroupBadgePartsEvent(event: GroupBadgePartsEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        if(this._groupCreatorModal)
        {
            const instance = (this._groupCreatorModal.componentInstance as GroupCreatorComponent);

            if(instance)
            {
                instance.badgeBases         = parser.bases;
                instance.badgeSymbols       = parser.symbols;
                instance.badgePartColors    = parser.baseColors;
                instance.groupColorsA  = parser.symbolColors;
                instance.groupColorsB   = parser.backgroundColors;
            }
        }
    }

    public getInfo(groupId: number): void
    {
        Nitro.instance.communication.connection.send(new GroupInformationComposer(groupId, true));
    }

    public getMembers(groupId: number, pageId: number, query: string, level: number): void
    {
        Nitro.instance.communication.connection.send(new GroupMembersComposer(groupId, pageId, query, level));
    }

    public join(groupId: number): void
    {
        if(this._roomInfoComponent.groupType === 0)
        {
            this._ngZone.run(() =>
            {
                this._roomInfoComponent.groupMember = true;
            });
        }
        
        Nitro.instance.communication.connection.send(new GroupJoinComposer(groupId));
    }

    public giveAdmin(groupId: number, memberId: number): void
    {
        Nitro.instance.communication.connection.send(new GroupAdminGiveComposer(groupId, memberId));
    }

    public takeAdmin(groupId: number, memberId: number): void
    {
        Nitro.instance.communication.connection.send(new GroupAdminTakeComposer(groupId, memberId));
    }

    public acceptMembership(groupId: number, memberId: number): void
    {
        Nitro.instance.communication.connection.send(new GroupMembershipAcceptComposer(groupId, memberId));
    }

    public declineMembership(groupId: number, memberId: number): void
    {
        Nitro.instance.communication.connection.send(new GroupMembershipDeclineComposer(groupId, memberId));
    }

    public removeMember(groupId: number, memberId: number): void
    {
        Nitro.instance.communication.connection.send(new GroupConfirmRemoveMemberComposer(groupId, memberId));
    }

    public deleteGroup(groupId: number): void
    {
        Nitro.instance.communication.connection.send(new GroupDeleteComposer(groupId));
    }

    public openProfile(userId: number): void
    {
        Nitro.instance.communication.connection.send(new UserProfileComposer(userId));
    }

    public openGroupCreator(): void
    {
        if(this._groupCreatorModal) return;

        this._groupCreatorModal = this._modalService.open(GroupCreatorComponent, {
            backdrop: 'static',
            centered: true,
            keyboard: false
        });

        if(this._groupCreatorModal)
        {
            this._groupCreatorModal.result.then(() => (this._groupCreatorModal = null));
        }

        Nitro.instance.communication.connection.send(new GroupBuyDataComposer());
    }

    public set groupRoomInfoComponent(component: GroupRoomInfoComponent)
    {
        this._roomInfoComponent = component;
    }

    public set groupInfoComponent(component: GroupInfoComponent)
    {
        this._groupInfoComponent = component;
    }

    public set groupMembersComponent(component: GroupMembersComponent)
    {
        this._groupMembersComponent = component;
    }
}