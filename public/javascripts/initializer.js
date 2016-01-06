import {User} from './models/user'
import {Pantry} from './models/pantry'
import {Shipment} from './models/shipment'
import {models} from './container'

User.prototype.relatedModels.pantry = Pantry;
Pantry.prototype.relatedModels.user = User;
Pantry.prototype.relatedCollections.shipment = Shipment;
Shipment.prototype.relatedModels.pantry = Pantry;