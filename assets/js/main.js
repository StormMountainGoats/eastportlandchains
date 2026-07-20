const inventoryConfig = {
  divisionInStock: true
};

/*
  Shared helpers
*/

function setElementsDisabled(container, disabled) {
  if (!container) {
    return;
  }

  const controls = container.querySelectorAll(
    "input, select, textarea, button"
  );

  controls.forEach((control) => {
    control.disabled = disabled;
  });
}

function showFormStatus(statusElement, message, statusType = "success") {
  if (!statusElement) {
    return;
  }

  statusElement.textContent = message;
  statusElement.dataset.status = statusType;
  statusElement.hidden = false;
  statusElement.focus();
}

function hideFormStatus(statusElement) {
  if (!statusElement) {
    return;
  }

  statusElement.textContent = "";
  statusElement.removeAttribute("data-status");
  statusElement.hidden = true;
}

function focusFirstInvalidField(form) {
  const firstInvalidField = form.querySelector(":invalid");

  if (firstInvalidField) {
    firstInvalidField.focus();
  }
}

/*
  Product inventory status
*/

const stockStatus = document.querySelector("#stock-status");

const productActions = document.querySelectorAll(
  "#product-action, #product-action-bottom"
);

if (stockStatus && productActions.length > 0) {
  if (inventoryConfig.divisionInStock) {
    stockStatus.textContent = "In stock";

    productActions.forEach((button) => {
      button.textContent = "Choose Your Configuration";
      button.setAttribute("href", "order.html");
    });
  } else {
    stockStatus.textContent = "Out of stock";

    productActions.forEach((button) => {
      button.textContent = "Join the Waitlist";
      button.setAttribute("href", "waitlist.html");
    });
  }
}

/*
  Order form
*/

const orderForm = document.querySelector("#division-order-form");

if (orderForm) {
  const fulfillmentOptions = orderForm.querySelectorAll(
    'input[name="fulfillment"]'
  );

  const pickupFields = orderForm.querySelector("#pickup-fields");
  const shippingFields = orderForm.querySelector("#shipping-fields");

  const pickupPaymentOptions = orderForm.querySelector(
    "#pickup-payment-options"
  );

  const shippingPaymentOptions = orderForm.querySelector(
    "#shipping-payment-options"
  );

  const pickupWindow = orderForm.querySelector(
    'select[name="pickupWindow"]'
  );

  const shippingRequiredFields = [
    orderForm.querySelector('input[name="shippingAddress"]'),
    orderForm.querySelector('input[name="shippingCity"]'),
    orderForm.querySelector('select[name="shippingState"]'),
    orderForm.querySelector('input[name="shippingZip"]')
  ].filter(Boolean);

  const paymentOptions = orderForm.querySelectorAll(
    'input[name="paymentMethod"]'
  );

  const orderFormStatus = orderForm.querySelector(
    "#order-form-status"
  );

  function clearPaymentSelection() {
    paymentOptions.forEach((option) => {
      option.checked = false;
      option.required = false;
      option.disabled = true;
    });
  }

  function setPaymentOptions(container, active) {
    if (!container) {
      return;
    }

    const options = container.querySelectorAll(
      'input[name="paymentMethod"]'
    );

    options.forEach((option, index) => {
      option.disabled = !active;
      option.required = active && index === 0;
    });
  }

  function updateFulfillmentFields() {
    const selectedFulfillment = orderForm.querySelector(
      'input[name="fulfillment"]:checked'
    );

    hideFormStatus(orderFormStatus);
    clearPaymentSelection();

    if (!selectedFulfillment) {
      pickupFields.hidden = true;
      shippingFields.hidden = true;
      pickupPaymentOptions.hidden = true;
      shippingPaymentOptions.hidden = true;

      setElementsDisabled(pickupFields, true);
      setElementsDisabled(shippingFields, true);
      setElementsDisabled(pickupPaymentOptions, true);
      setElementsDisabled(shippingPaymentOptions, true);

      pickupWindow.required = false;

      shippingRequiredFields.forEach((field) => {
        field.required = false;
      });

      fulfillmentOptions.forEach((option) => {
        option.setAttribute("aria-expanded", "false");
      });

      return;
    }

    const isPickup =
      selectedFulfillment.value === "Local pickup or handoff";

    pickupFields.hidden = !isPickup;
    shippingFields.hidden = isPickup;
    pickupPaymentOptions.hidden = !isPickup;
    shippingPaymentOptions.hidden = isPickup;

    setElementsDisabled(pickupFields, !isPickup);
    setElementsDisabled(shippingFields, isPickup);

    setElementsDisabled(pickupPaymentOptions, !isPickup);
    setElementsDisabled(shippingPaymentOptions, isPickup);

    pickupWindow.required = isPickup;

    shippingRequiredFields.forEach((field) => {
      field.required = !isPickup;
    });

    setPaymentOptions(pickupPaymentOptions, isPickup);
    setPaymentOptions(shippingPaymentOptions, !isPickup);

    fulfillmentOptions.forEach((option) => {
      const controlsPickup =
        option.value === "Local pickup or handoff";

      option.setAttribute(
        "aria-expanded",
        String(
          (controlsPickup && isPickup) ||
          (!controlsPickup && !isPickup)
        )
      );
    });
  }

  fulfillmentOptions.forEach((option) => {
    option.addEventListener("change", updateFulfillmentFields);
  });

  orderForm.addEventListener("input", () => {
    hideFormStatus(orderFormStatus);
  });

  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hideFormStatus(orderFormStatus);

    if (!orderForm.checkValidity()) {
      orderForm.reportValidity();
      focusFirstInvalidField(orderForm);
      return;
    }

    showFormStatus(
      orderFormStatus,
      "The form is working correctly. Secure submission and confirmation email delivery will be connected next.",
      "success"
    );
  });

  updateFulfillmentFields();
}

/*
  Waitlist form
*/

const waitlistForm = document.querySelector(
  "#division-waitlist-form"
);

if (waitlistForm) {
  if (inventoryConfig.divisionInStock) {
    waitlistForm.innerHTML = `
      <div
        class="waitlist-unavailable"
        role="status"
        aria-live="polite"
      >
        <h2>The Division is currently in stock.</h2>

        <p>You can submit an order request now.</p>

        <a class="button" href="order.html">
          Choose Your Configuration
        </a>
      </div>
    `;
  } else {
    const waitlistFormStatus = waitlistForm.querySelector(
      "#waitlist-form-status"
    );

    waitlistForm.addEventListener("input", () => {
      hideFormStatus(waitlistFormStatus);
    });

    waitlistForm.addEventListener("submit", (event) => {
      event.preventDefault();
      hideFormStatus(waitlistFormStatus);

      if (!waitlistForm.checkValidity()) {
        waitlistForm.reportValidity();
        focusFirstInvalidField(waitlistForm);
        return;
      }

      showFormStatus(
        waitlistFormStatus,
        "The waitlist form is working correctly. Secure submission and restock-notification storage will be connected next.",
        "success"
      );
    });
  }
}