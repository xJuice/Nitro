import { NitroEvent } from '../../../../../client/core/events/NitroEvent';
import { RoomEngineObjectEvent } from '../../../../../client/nitro/room/events/RoomEngineObjectEvent';
import { RoomEngineTriggerWidgetEvent } from '../../../../../client/nitro/room/events/RoomEngineTriggerWidgetEvent';
import { RoomObjectVariable } from '../../../../../client/nitro/room/object/RoomObjectVariable';
import { IRoomWidgetHandler } from '../../../../../client/nitro/ui/IRoomWidgetHandler';
import { IRoomWidgetHandlerContainer } from '../../../../../client/nitro/ui/IRoomWidgetHandlerContainer';
import { RoomWidgetEnum } from '../../../../../client/nitro/ui/widget/enums/RoomWidgetEnum';
import { RoomWidgetUpdateEvent } from '../../../../../client/nitro/ui/widget/events/RoomWidgetUpdateEvent';
import { RoomWidgetMessage } from '../../../../../client/nitro/ui/widget/messages/RoomWidgetMessage';
import { MannequinWidget } from '../furniture/mannequin/mannequin.component';

export class FurnitureMannequinWidgetHandler implements IRoomWidgetHandler
{
    private _isDisposed: boolean = false;
    private _container: IRoomWidgetHandlerContainer = null;
    private _widget: MannequinWidget;

    public dispose():void
    {
        this._isDisposed    = true;
        this._container     = null;
    }

    public processWidgetMessage(k: RoomWidgetMessage): RoomWidgetUpdateEvent
    {
        return null;
    }

    public processEvent(event: NitroEvent): void
    {
        switch(event.type)
        {
            case RoomEngineTriggerWidgetEvent.REQUEST_MANNEQUIN: {
                const roomObjectEvent   = (event as RoomEngineObjectEvent);
                const roomObject        = this._container.roomEngine.getRoomObject(roomObjectEvent.roomId, roomObjectEvent.objectId, roomObjectEvent.category);

                if(!roomObject) return;

                const model = roomObject.model;

                const figure    = model.getValue<string>(RoomObjectVariable.FURNITURE_MANNEQUIN_FIGURE);
                const gender    = model.getValue<string>(RoomObjectVariable.FURNITURE_MANNEQUIN_GENDER);
                const name      = model.getValue<string>(RoomObjectVariable.FURNITURE_MANNEQUIN_NAME);

                if(figure && gender) this._widget.open(roomObject.id,figure, gender, name);

                return;
            }
        }
    }

    public update():void
    {
    }


    public get widget(): MannequinWidget
    {
        return this._widget;
    }

    public set widget(widget: MannequinWidget)
    {
        this._widget = widget;
    }

    public get disposed(): boolean
    {
        return this._isDisposed;
    }

    public get type(): string
    {
        return RoomWidgetEnum.MANNEQUIN;
    }

    public set container(k: IRoomWidgetHandlerContainer)
    {
        this._container = k;
    }

    public get container(): IRoomWidgetHandlerContainer
    {
        return this._container;
    }

    public get messageTypes(): string[]
    {
        return [];
    }

    public get eventTypes(): string[]
    {
        return [ RoomEngineTriggerWidgetEvent.REQUEST_MANNEQUIN ];
    }
}
