var doc = null

function main() {

    // Patch: Make buttons tabbable(fix them being divs instead of buttons) to enter courses
    // Looks like someone changed the elearning to make some of the buttons inputs instead of divs,
    // but not all of them. They also changed some of the content sections to be tabbable, but not all of them
    // This fixes that inconsistency 
    doc.querySelectorAll(".pt_button").forEach(element => {
        // if this element is a div
        if(element && element.innerHTML && element.tagName == "DIV") {
            const atts = Array.prototype.slice.call(element.attributes)
            element.outerHTML = `<button ${atts.map(
            attr => (attr.name + '="' + attr.value.replaceAll("\"", "'") + '"')
            ).join(' ')} aria-label="${element.parentElement?.parentElement?.querySelector(".modlist_line1")?.innerHTML ? "Open SCORM Module (" + element.parentElement?.parentElement?.querySelector(".modlist_line1")?.innerHTML + " in a New Window." : element.innerHTML}">${element.innerHTML}</button>`
        }
    });

    doc.querySelectorAll(".content_item_open_button").forEach(element => {
        element.outerHTML = `<button class="pt_button user_theme_button page_bg_custom course_portal" onclick="${element.getAttribute("onclick")}" aria-label="${"Open SCORM Module (" + element.parentElement.parentElement.querySelector(".heading_item_title").innerHTML + " in a New Window."}">${element.getAttribute("value")}</button>`
    });

    // Patch: Makes the tabstrip accessible.
    let tabstrip = doc.querySelector(".page_tabstrip_widget__flat")

    if(tabstrip) {
        let children = tabstrip.children[0].children

        for(let i = 0; i < children.length; i++) {
            let element = children[i]
            if(element.tagName == "DIV") {
                const atts = Array.prototype.slice.call(element.attributes)
                element.outerHTML = `<button ${atts.map(
                attr => (attr.name + '="' + attr.value.replaceAll("\"", "'") + '"')
                ).join(' ')} tabindex="0" role="tab" style="margin-bottom: 0px; margin-top:0px; border: none; height: 35px;" aria-label="${element.children[0].innerHTML}">${element.innerHTML}</button>`
            }

            let selected = element.classList.contains("page_tabstrip_menu_item_current")
            element.style.backgroundColor = selected ? "#fff" : "transparent"

            // set aria selected
            element.setAttribute("aria-selected", selected)
        }
    }


    // Not all content items are tabbable, only the first one is
    // Patch: Fix this inconsistency
    doc.querySelectorAll(".content_item").forEach(element => {
        // same class name is used for different types of content items, need to add special cases
        if(element.children.length == 3) {
            // find the first child(none of them have ids or classes to be selected)
            const firstChild = element.children[0]

            // set it to be tabbable
            firstChild.setAttribute("tabindex", "0")
        } else {
            const child = element.children[0]?.children[1]
            if(child) child.setAttribute("tabindex", "0")
        }


    })

    // Patch: Make the exit button usable, by default it is neither a button nor tabbable
    let cancelButton = doc.querySelector("#cancel_button")
    if(cancelButton) {
        if(cancelButton.tagName == "DIV") {
            cancelButton.outerHTML = `<button id="cancel_button" title="Close Activity" onclick="confirmLOClose();" tabindex="0" style="border: none">X</button>`
        }
    }

    // Patch: Make the "BAck to All Courses" button usable, by default it is neither a button nor tabbable
    let backButton = doc.querySelector("#back-to-lp-bar-click-area")
    if(backButton) {
        if(backButton.tagName == "DIV") {
            const atts = Array.prototype.slice.call(backButton.attributes)
            backButton.outerHTML = `<button ${atts.map(
            attr => (attr.name + '="' + attr.value + '"')
            ).join(' ')} tabindex="0" style="width: auto;padding-right: 50px; border: none;">${backButton.innerHTML}</button>`
        }
    }



    // Patch: Make score odometer accessible with aria label
    let courseViewer = window.frames[1]?.frames[1]?.frames[1]?.frames[1]?.frames[0]?.document;
    if(courseViewer && !courseViewer.querySelector(".capfix-odometer-wrapper")) {
        let odometer = courseViewer.querySelector(".odometer")

        if(odometer) {
            odometer.setAttribute("aria-hidden", "true")

            // get parent
            let parent = odometer.parentElement

            let score = courseViewer.querySelector(".odometer__score-percent--hidden")?.innerHTML
            let passingScore = courseViewer.querySelector(".odometer__passpercent")?.innerHTML

            parent.setAttribute("aria-hidden", "false")
            parent.setAttribute("tabindex", "0")
            parent.setAttribute("aria-label", (score == undefined || passingScore == undefined) ? "Score Loading" : "You scored " + score + ". Passing score is " + passingScore)
        }
    }

    // Patch: Anything in Honor Credit is inaccessible
    doc.querySelectorAll(".wdg_clt_coursename_label").forEach(element => {
        element.setAttribute("tabindex", "0")
    })

    doc.querySelectorAll(".wdg_enrollment_catalog_button").forEach(element => {
        if(element.tagName == "DIV") {
            let title = element.parentElement.parentElement.parentElement.children[1].innerHTML

            const atts = Array.prototype.slice.call(element.attributes)
            element.outerHTML = `<button ${atts.map(
            attr => (attr.name + '="' + attr.value.replaceAll("\"", "'") + '"')
            ).join(' ')} tabindex="0" style="border: none; border-radius:10px; color: white !important;" aria-label="${element.children[0].innerHTML == "Info" ? `Info (${title})` : (element.children[1].innerHTML + ` (${title})`)}">${element.innerHTML}</button>`
        }
    })

    // Patch: Get rid of ghost links in test
    let onlineCourseContainer = window.frames[1]?.frames[1]?.document.querySelector("#logo_container")
    if(onlineCourseContainer != undefined && onlineCourseContainer != null) {
        let bodymain = doc.querySelector("#body_main")
        bodymain.style.display = "none"
    } else {
        // Patch: The body main does not have any attributes making it invisible to screen readers
        // when inside of page modules, causing "ghost links" that screen readers can see but visually are not there
        // This is bad for accessibility, so this patch makes it so screen readers can't see this
        // Strange how this wasn't display none when it should be in the first place
        let bodymain = doc.querySelector("#body_main")

        // have to do a frames length hack because can't find another way to differentiate between pages this should be applied to
        if(bodymain) bodymain.style.display = window.frames[1]?.frames[1]?.frames?.length > 1 ? "none" : "block"
    }

    // Make score page readable and accessible
    let scoreQuote1 = window?.frames[1]?.frames[1]?.document?.querySelectorAll("blockquote")[1]

    if(scoreQuote1) {
        scoreQuote1.children[0].setAttribute("tabindex", "0")
        scoreQuote1.children[1].setAttribute("tabindex", "0")
    }
}

function idle() {
    const frame = document.querySelector('[name="mainFrame"]')
    doc = window?.frames[1]?.document

    if(doc && doc.querySelector("body") != null && doc.querySelector("body").innerHTML.length > 0) {
       main()
    }
    setTimeout(idle, 50)
}
setTimeout(idle, 50)
