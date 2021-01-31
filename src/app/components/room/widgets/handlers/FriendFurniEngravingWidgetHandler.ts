import { IRoomWidgetHandler } from '../../../../../client/nitro/ui/IRoomWidgetHandler';
import { IRoomWidgetHandlerContainer } from '../../../../../client/nitro/ui/IRoomWidgetHandlerContainer';
import { FriendFurniEngravingWidget } from '../furniture/friendfurni/friendfurni.component';
import { RoomWidgetEnum } from '../../../../../client/nitro/ui/widget/enums/RoomWidgetEnum';
import { RoomEngineTriggerWidgetEvent } from '../../../../../client/nitro/room/events/RoomEngineTriggerWidgetEvent';
import { RoomWidgetMessage } from '../../../../../client/nitro/ui/widget/messages/RoomWidgetMessage';
import { RoomWidgetUpdateEvent } from '../../../../../client/nitro/ui/widget/events/RoomWidgetUpdateEvent';
import { NitroEvent } from '../../../../../client/core/events/NitroEvent';

export class FriendFurniEngravingWidgetHandler implements IRoomWidgetHandler
{
    private _isDisposed: boolean = false;
    private _container: IRoomWidgetHandlerContainer = null;
    private _widget: FriendFurniEngravingWidget = null;

    public get disposed(): boolean
    {
        return this._isDisposed;
    }

    public get type(): string
    {
        return RoomWidgetEnum.FRIEND_FURNI_ENGRAVING;
    }

    public get container(): IRoomWidgetHandlerContainer
    {
        return this._container;
    }

    public set container(container: IRoomWidgetHandlerContainer)
    {
        this._container = container;
    }

    public set widget(widget: FriendFurniEngravingWidget)
    {
        this._widget = widget;
    }

    public dispose(): void
    {
        this._container = null;
        this._widget = null;
        this._isDisposed = true;
    }

    public processEvent(event: NitroEvent): void
    {
        if(this.disposed || event == null) return;

        let widgetEvent: RoomEngineTriggerWidgetEvent = null;

        switch(event.type)
        {
            case RoomEngineTriggerWidgetEvent.REQUEST_FRIEND_FURNITURE_ENGRAVING:
                widgetEvent = (event as RoomEngineTriggerWidgetEvent);
                debugger;
                if(widgetEvent && this._container.roomEngine && this._widget)
                {
                    const roomObject = this._container.roomEngine.getRoomObject(widgetEvent.roomId, widgetEvent.objectId, widgetEvent.category);

                    if(roomObject != null)
                    {
                        const model = roomObject.model; // local_4
                        if(model != null)
                        {
                            // _local_5 = new StringArrayStuffData();
                            // _local_5.initializeFromRoomObjectModel(model);
                            // this._widget.open(roomObject.id, _local_4.getNumber(RoomObjectVariableEnum.FURNITURE_FRIENDFURNI_ENGRAVING_TYPE), _local_5);
                        }
                    }
                }
                return;
        }
    }

    public processWidgetMessage(message: RoomWidgetMessage): RoomWidgetUpdateEvent
    {
        return null;
    }

    public get eventTypes(): string[]
    {
        return [ RoomEngineTriggerWidgetEvent.REQUEST_FRIEND_FURNITURE_ENGRAVING ];
    }

    public get messageTypes(): string[]
    {
        return [];
    }

    public update():void
    {
    }
}
