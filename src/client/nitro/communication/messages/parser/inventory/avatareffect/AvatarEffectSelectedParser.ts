﻿import { IMessageDataWrapper } from '../../../../../../core/communication/messages/IMessageDataWrapper';
import { IMessageParser } from '../../../../../../core/communication/messages/IMessageParser';

export class AvatarEffectSelectedParser implements IMessageParser
{
    private _type: number;

    public flush(): boolean
    {
        this._type = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._type = wrapper.readInt();

        return true;
    }

    public get type(): number
    {
        return this._type;
    }
}