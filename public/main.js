// @ts-check

import { APIWrapper, API_EVENT_TYPE } from "./api.js";
import { addMessage, animateGift, isPossiblyAnimatingGift, isAnimatingGiftUI } from "./dom_updates.js";
const api = new APIWrapper(null, true, true);

// console.log("apiWrapperNedir", APIWrapper);


function EventQ() {
    this.eventQarray = [];

    this.publish = function(events) {

        if (events.length == 0) return;

        this.eventQarray.push(...events);

    }

    this.consume = function() {

        var that = this;

        return new Promise(function(resolve, reject) {

            let firstEvent = that.eventQarray[0];

            if (firstEvent != undefined) {

                resolve(that.eventQarray.shift());

            } else {
                reject({
                    error: true,
                    message: "Has no item !"
                });
            }
        });
    }
}


function Qmanager() {

    this.animationGiftQ = new EventQ();

    this.messageAndGiftQ = new EventQ();

    this.pushToQ = function(events) {
        console.log("Filter", events.filter((t) => t.type == API_EVENT_TYPE.ANIMATED_GIFT));
        this.animationGiftQ.publish(events.filter((t) => t.type == API_EVENT_TYPE.ANIMATED_GIFT));

        this.messageAndGiftQ.publish(events.filter((t) => t.type != API_EVENT_TYPE.ANIMATED_GIFT));


    }
    this.processAnimationGiftQ = async function() {
        // reqursive fonksiyon
        try {

            if (!isPossiblyAnimatingGift()) {

                let event = await this.animationGiftQ.consume();

                animateGift(event);

            }
        } catch (ex) {}

        setTimeout(() => {
            this.processAnimationGiftQ();

        }, 500);
    }

    this.processMessageAndGiftQ = async function() {

        try {

            let event = await this.messageAndGiftQ.consume();

            addMessage(event);


        } catch (ex) {}

        setTimeout(() => {

            this.processMessageAndGiftQ();
        }, 500);
    }
    this.processAnimationGiftQ();

    this.processMessageAndGiftQ();

}
var qManager = new Qmanager();


api.setEventHandler((events) => {

    qManager.pushToQ(events);

});
// NOTE: UI helper methods from `dom_updates` are already imported above.