if (location.protocol !== "https:") {
    location.replace(location.href.replace(/^http:/, "https:"));
}

document.addEventListener("DOMContentLoaded", function () {
    const navToggle = document.querySelector("[data-nav-toggle]");
    if (navToggle) {
        navToggle.addEventListener("click", function () {
            const isOpen = document.body.classList.toggle("nav-open");
            navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    document.querySelectorAll("[data-main-nav] a").forEach(function (link) {
        link.addEventListener("click", function () {
            document.body.classList.remove("nav-open");
            if (navToggle) {
                navToggle.setAttribute("aria-expanded", "false");
            }
        });
    });

    const pricing = document.querySelector("#pricing[data-pricing-plans]");
    if (pricing) {
        const plans = JSON.parse(pricing.dataset.pricingPlans || "[]");
        const slider = pricing.querySelector("[data-learner-slider]");
        const learners = pricing.querySelector("[data-calc-learners]");
        const annual = pricing.querySelector("[data-calc-annual]");
        const cost = pricing.querySelector("[data-calc-cost]");
        const setup = pricing.querySelector("[data-calc-setup]");
        const cta = pricing.querySelector("[data-calc-cta]");
        const money = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
        const number = new Intl.NumberFormat("en-AU");

        function updatePricing() {
            const index = parseInt(slider.value, 10) || 0;
            const plan = plans[index] || plans[0];
            learners.textContent = number.format(plan.learners);
            annual.textContent = money.format(plan.annual) + " per year";
            cost.textContent = plan.cost.replace(" per user", " per year");
            setup.textContent = money.format(plan.setup) + " one-time";
            cta.textContent = "Get Started with " + plan.label.replace("Up to ", "") + " Users";
        }
        if (slider && plans.length) {
            slider.addEventListener("input", updatePricing);
            updatePricing();
        }
    }

    const upgradeForm = document.querySelector("[data-upgrade-form]");
    const selectedInput = document.querySelector("[data-selected-upgrade]");
    const selectedText = document.querySelector("[data-selected-upgrade-text]");
    const warning = document.querySelector("[data-upgrade-warning]");
    document.querySelectorAll("[data-upgrade-package]").forEach(function (card) {
        card.addEventListener("click", function () {
            document.querySelectorAll("[data-upgrade-package]").forEach(function (item) {
                item.classList.remove("is-selected");
            });
            card.classList.add("is-selected");
            selectedInput.value = card.dataset.upgradePackage;
            selectedText.textContent = "Selected package: " + card.dataset.upgradeLabel;
            warning.classList.add("is-hidden");
            document.querySelector("#upgrade-form").scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
    if (upgradeForm) {
        upgradeForm.addEventListener("submit", function (event) {
            if (!selectedInput.value) {
                event.preventDefault();
                warning.classList.remove("is-hidden");
                document.querySelector("#packages").scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    }

    const pluginSearch = document.querySelector("[data-plugin-search]");
    if (pluginSearch) {
        const cards = Array.from(document.querySelectorAll("[data-plugin-card]"));
        const empty = document.querySelector("[data-no-plugin-results]");
        pluginSearch.addEventListener("input", function () {
            const query = pluginSearch.value.trim().toLowerCase();
            let shown = 0;
            cards.forEach(function (card) {
                const match = !query || (card.dataset.pluginText || "").includes(query);
                card.hidden = !match;
                if (match) {
                    shown++;
                }
            });
            empty.hidden = shown > 0;
        });
    }

    const mainNavigation = document.querySelector("#main-navigation");
    if (mainNavigation) {
        const currentPath = window.location.pathname.replace(/\/index\.php$/, "/");
        const currentHash = window.location.hash;

        function normalizePath(path) {
            if (!path || path === "/index.php") {
                return "/";
            }

            return path.replace(/\/$/, "");
        }

        function setActiveNavigation() {
            const normalizedCurrentPath = normalizePath(currentPath);

            mainNavigation.querySelectorAll("a").forEach(function (link) {
                const linkUrl = new URL(link.getAttribute("href"), window.location.origin);
                const linkPath = normalizePath(linkUrl.pathname);
                const linkHash = linkUrl.hash;

                let isActive = false;

                if (linkHash) {
                    isActive = normalizedCurrentPath === linkPath && currentHash === linkHash;
                } else if (linkPath === "/plugins") {
                    isActive = normalizedCurrentPath === "/plugins"
                        || normalizedCurrentPath === "/plugin"
                        || normalizedCurrentPath.startsWith("/plugin/");
                } else {
                    isActive = normalizedCurrentPath === linkPath && !currentHash;
                }

                link.classList.toggle("is-active", isActive);
            });
        }

        setActiveNavigation();

        window.addEventListener("hashchange", function () {
            location.reload();
        });
    }
});
