import { Kernel } from "inversify";
import "reflect-metadata";
import { Weapon} from "./Weapon";
import { ThrowableWeapon} from "./ThrowableWeapon";
import { Warrior} from "./Warrior";
import TYPES from "./types";

import { Ninja, Katana, Shuriken } from "./implementations";

var kernel = new Kernel();
kernel.bind<Warrior>(TYPES.Warrior).to(Ninja);
kernel.bind<Weapon>(TYPES.Weapon).to(Katana);
kernel.bind<ThrowableWeapon>(TYPES.ThrowableWeapon).to(Shuriken);

export default kernel;