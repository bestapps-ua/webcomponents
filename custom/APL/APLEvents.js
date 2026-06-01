class APLEvents {
    static encode(component, key, value) {
        let data = component.getAPLData();
        let events = component.getAPLEvents();
        let event = events[key];
        data[key] = value;
    }

    static decode(component){
        let events = component.getAPLEvents();
        let evs = {};
        try{
            let data = component.getAPLData();
            for (const key in events) {
                let event = events[key];
                try {
                    let value = data[key];
                    if (typeof value === 'undefined') {
                        value = event.default || '';
                    }
                    evs[key] = JSON.parse(JSON.stringify(event));
                    evs[key].value = value;
                    events[key].value = value;
                } catch (err) {
                    console.warn('[err decodeByComponent event]', {err, key, event, component});
                }
            }
        }catch(err){
            console.warn('[err decodeByComponent]', {err, component});
        }
        return evs;
    }
}