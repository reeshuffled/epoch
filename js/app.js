const SAVE_LOCATION = "epoch";

const yearsSection = document.getElementById("yearsSection");
const yearsBar = document.getElementById("yearsProgress");
const yearsDisplay = document.getElementById("yearsDisplay");

const monthsSection = document.getElementById("monthsSection");
const monthsBar = document.getElementById("monthsProgress");
const monthsDisplay = document.getElementById("monthsDisplay");

const daysSection = document.getElementById("daysSection");
const daysBar = document.getElementById("daysProgress");
const daysDisplay = document.getElementById("daysDisplay");

const hoursSection = document.getElementById("hoursSection");
const hoursBar = document.getElementById("hoursProgress");
const hoursDisplay = document.getElementById("hoursDisplay");

const minutesSection = document.getElementById("minutesSection");
const minutesBar = document.getElementById("minutesProgress");
const minutesDisplay = document.getElementById("minutesDisplay");

const secondsBar = document.getElementById("secondsProgress");
const secondsDisplay = document.getElementById("secondsDisplay");

const lastMilestoneEl = document.getElementById("lastMilestone");
const nextMilestoneEl = document.getElementById("nextMilestone");

const epochInputEl = document.getElementById("userInput");

const epochDisplayEl = document.getElementById("epoch");

const setEpochButton = document.getElementById("setEpoch");
const shareEpochButton = document.getElementById("shareEpoch");
const setToNowButton = document.getElementById("setToNow");

// the time that is being counted from
let epoch;

/**
 * Initialize UI components.
 */
(function initUI() {
    // get epoch from storage
    epoch = checkForLocalStorage() ? localStorage.getItem("epoch") : null;

    // check if there is a epoch in the link, meaning that this is a share link
    const url = window.location.href;
    if (url.indexOf("#") != -1)
    {
        // get the anchor text and convert to date
        const anchor = decodeURIComponent(url.substring(url.indexOf("#") + 1));
        const date = new Date(anchor);

        // check if is a valid date
        if (!isNaN(date))
        {
            // save datetime
            localStorage.setItem(SAVE_LOCATION, anchor);
            
            // set epoch
            epoch = date;

            // remove anchor
            removeHash();
        }
    }

    // if the user has defined an epoch
    if (epoch)
    {
        // convert epoch string to date object
        epoch = new Date(epoch);

        epochDisplayEl.style.display = "";
        epochDisplayEl.innerText = `${epoch.toLocaleString()}`;

        // calculate elapsed time
        updateDisplay();

        // update elapsed time every second
        setInterval(updateDisplay, 1000);
    }
    // if the user has not defined an epoch
    else
    {
        getEpoch();
    }

    // bind button actions
    setEpochButton.onclick = getEpoch;
    setToNowButton.onclick = () => epochInputEl.value = dateToLocalISO(new Date());
    shareEpochButton.onclick = () => {
        // check to make sure that a epoch is saved before creating URL
        if (localStorage.getItem(SAVE_LOCATION))
        {
            // create URL for epoch
            const anchor = encodeURIComponent(localStorage.getItem("epoch"));
            const url = `${window.location.href}#${anchor}`;

            // copy to clipboard
            navigator.clipboard.writeText(url)
                // success callback
                .then(() => {
                    alert("Epoch sharing URL copied successfully.");
                },
                // error callback
                () => {
                    alert("URL copying failed.");
                });
        }
        // alert the user if they have not defined an epoch yet
        else
        {
            alert("You have not set an epoch yet.");
        }
    }
})();

/**
 * Show the epoch input screen to allow the user to define an epoch.
 */
function getEpoch() {
    // show input screen
    document.getElementById("inputScreen").style.display = "";

    // hide bars read out
    document.getElementById("bars").style.display = "none";
    document.getElementById("milestones").style.display = "none";

    // show current epoch if one is defined
    if (epoch)
    {
        epochInputEl.value = dateToLocalISO(epoch);
    }

    // bind to submit button
    document.getElementById("saveDatetime").onclick = () => {
        // save date time
        localStorage.setItem(SAVE_LOCATION, epochInputEl.value);

        // set as epoch
        epoch = new Date(epochInputEl.value);

        // show bars read out
        document.getElementById("bars").style.display = "";
        document.getElementById("milestones").style.display = "";

        // hide input input screen
        document.getElementById("inputScreen").style.display = "none";

        // update display right now so we don't have to wait a second
        updateDisplay();

        // update display every second
        setInterval(updateDisplay, 1000);
    }
}

/**
 * Calculate the elapsed time since the starting point and update the bars.
 */
function updateDisplay() {
    // get the current time in milliseconds
    const now = new Date().getTime();

    // get total seconds from milliseconds
    let elapsed = Math.floor((now - epoch) / 1000);

    const years = Math.floor(elapsed / (365 * 24 * 60 * 60));
    elapsed = elapsed - years * (365 * 24 * 60 * 60);

    // hide years if there haven't been any that have elapsed
    if (years === 0)
    {
        yearsSection.style.display = "none";
    }

    // calculate months
    const months = Math.floor(elapsed / (30 * 24 * 60 * 60));
    elapsed = elapsed - months * (30 * 24 * 60 * 60);

    // hide months if there haven't been any that have elapsed
    if (months === 0 && years === 0)
    {
        monthsSection.style.display = "none";
    }

    // calculate days
    const days = Math.floor(elapsed / (24 * 60 * 60));
    elapsed = elapsed - days * (24 * 60 * 60);

    // hide days if there haven't been any that have elapsed
    if (days === 0 && months === 0)
    {
        daysSection.style.display = "none";
    }

    // calculate hours
    const hours = Math.floor(elapsed / (60 * 60));    
    elapsed = elapsed - hours * (60 * 60);

    // hide hours if there haven't been any that have elapsed
    if (hours === 0 && days === 0)
    {
        hoursSection.style.display = "none";
    }

    // calculate minutes
    const minutes = Math.floor(elapsed / 60);

    // hide minutes if there haven't been any that have elapsed
    if (minutes === 0 && hours === 0)
    {
        minutesSection.style.display = "none";
    }

    // calculate seconds
    const seconds = elapsed - minutes * 60;

    // update progress bar values
    yearsBar.value = years;
    monthsBar.value = months;
    daysBar.value = days;
    hoursBar.value = hours;
    minutesBar.value = minutes;
    secondsBar.value = seconds;

    // update time readouts
    yearsDisplay.innerText = `${years} ${years == 1 ? "year" : "years"}`;
    monthsDisplay.innerText = `${months} ${months == 1 ? "month" : "months"}`;
    daysDisplay.innerText = `${days} ${days == 1 ? "day" : "days"}`;
    hoursDisplay.innerText = `${hours} ${hours == 1 ? "hour" : "hours"}`;
    minutesDisplay.innerText = `${minutes} ${minutes == 1 ? "minute" : "minutes"}`;
    secondsDisplay.innerText = `${seconds} ${seconds == 1 ? "second" : "seconds"}`;

    // calculate and update milestones
    const milestones = calculateMilestones(days);
    lastMilestoneEl.innerHTML = milestones.lastMilestone;
    nextMilestoneEl.innerHTML = milestones.nextMilestone;
}

/**
 * Calculate milestone milestones (last and next).
 * @param {number} days - The number of days elapsed/remaining
 * @param {number} now - The current time in milliseconds
 * @returns {Object} Object with lastMilestone and nextMilestone properties
 */
function calculateMilestones(days) {
    const now = new Date().getTime();

    let lastMilestone = "", nextMilestone = "";
    
    // get the total days (elapsed or remaining)
    const totalDays = Math.floor((now - epoch) / (1000 * 24 * 60 * 60));
    
    // check if epoch is more than a month away (in future)
    const useMonthlyMilestones = totalDays > 30;
    
    // first milestone is one day, so if there are no days elapsed or remaining, show that milestone
    if (days === 0)
    {
        lastMilestone = "N/A";
        nextMilestone = "1 day";
    }
    else if (useMonthlyMilestones)
    {
        // Use monthly milestones when epoch is more than a month away
        const totalMonths = Math.round(totalDays / 30);
        
        if (totalMonths === 0)
        {
            lastMilestone = "N/A";
            nextMilestone = "1 month";
        }
        else if (totalMonths > 0)
        {
            // Counting up from past epoch
            const last = Math.floor(totalMonths / 1) * 1;
            const next = Math.ceil(totalMonths / 1) * 1;
            
            lastMilestone = `${last} ${last == 1 ? "month" : "months"}`;
            nextMilestone = `${next} ${next == 1 ? "month" : "months"}`;
        }
        else
        {
            // Counting down to future epoch
            const next = Math.ceil(Math.abs(totalMonths));
            lastMilestone = "N/A";
            nextMilestone = `${next} ${next == 1 ? "month" : "months"}`;
        }
    }
    else
    {
        // get last multiple of 5 days, or last month
        const last = Math.floor(days / 5) * 5;

        // if the last milestone was a month milestone
        if (last % 30 === 0 && last !== 0)
        {
            lastMilestone = `${last / 30} ${last / 30 == 1 ? "month" : "months"}`;
        }
        else
        {
            // get the one day milestone
            if (last === 0 && days < 5)
            {
                lastMilestone = `1 day`;
            }
            else
            {
                lastMilestone = `${last} days`;
            }
        }

        // get next multiple of 5 days, or next month
        const next = Math.ceil(days / 5) * 5;
        if (next % 30 === 0)
        {
            nextMilestone = `${next / 30} ${next / 30 == 1 ? "month" : "months"}`;
        }
        // if currently on a milestone, add five days to get next milestone
        else if (days % 5 === 0)
        {
            nextMilestone = `${next + 5} days`;
        }
        else
        {
            nextMilestone = `${next} days`;
        }
    }
    
    return { lastMilestone, nextMilestone };
}

/**
 * Check if localStorage exist and is available.
 * https://stackoverflow.com/questions/16427636/check-if-localstorage-is-available/16427747
 * @return {Boolean} localStorageExists
 */
function checkForLocalStorage(){
    const test = "test";

    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);

        return true;
    } catch(e) {
        return false;
    }
}

/**
 * https://stackoverflow.com/questions/17415579/how-to-iso-8601-format-a-date-with-timezone-offset-in-javascript
 * @param {Date} date
 * @returns {String} localizedISODateString
 */
function dateToLocalISO(date) {
    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60 * 1000).toISOString().substr(0,16);
}

/**
 * Remove the anchor from a URL without refreshing or leaving the hash behind.
 * https://stackoverflow.com/questions/1397329/how-to-remove-the-hash-from-window-location-url-with-javascript-without-page-r/5298684#5298684
 */
function removeHash () { 
    history.pushState("", document.title, window.location.pathname + window.location.search);
}