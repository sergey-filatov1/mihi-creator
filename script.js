const certificateButton = document.querySelector("#certificate-button");
const invitationButton = document.querySelector("#invitation-button");
const editor = document.querySelector("#editor");

let photoPosition = { x: 0, y: 0 };
let photoScale = 1;
let photoUrl = null;

// =====================================
// КОНСТРУКТОР СЕРТИФИКАТА
// =====================================

certificateButton.addEventListener("click", () => {
    document.querySelector("#certificate-result").innerHTML = "";
    editor.innerHTML = `
    <div class="constructor-card">
      <h2>Сертифікат Mihi</h2>

      <form id="certificate-form">

        <label for="partner-photo">Фото партнера</label>
        <input
          type="file"
          id="partner-photo"
          accept="image/*"
          required
        >

        <p>Перетягніть фото мишкою, щоб відцентрувати його.</p>
        <p>Коліщатко миші — збільшення або зменшення.</p>

        <div id="photo-preview"></div>

        <label for="partner-name">Ім'я та прізвище</label>
        <input
          type="text"
          id="partner-name"
          placeholder="Введіть ім'я та прізвище"
          required
        >

        <label for="partner-status">Статус</label>
        <input
          type="text"
          id="partner-status"
          placeholder="Введіть статус"
          required
        >

        <label for="partner-percent">
          Відсоток маркетинг-плану
        </label>

        <input
          type="number"
          id="partner-percent"
          placeholder="Наприклад, 21"
          min="0"
          max="100"
          required
        >

        <button type="submit">
          Створити сертифікат
        </button>

      </form>
    </div>
  `;

    const certificateForm = document.querySelector("#certificate-form");
    const photoInput = document.querySelector("#partner-photo");
    const photoPreview = document.querySelector("#photo-preview");

    photoPosition = { x: 0, y: 0 };
    photoScale = 1;

    // =====================================
    // ЗАВАНТАЖЕННЯ ФОТО ТА РУЧНЕ КАДРУВАННЯ
    // =====================================

    photoInput.addEventListener("change", () => {
        const file = photoInput.files[0];

        if (!file) {
            photoPreview.innerHTML = "";
            photoUrl = null;
            return;
        }

        if (photoUrl) {
            URL.revokeObjectURL(photoUrl);
        }

        photoUrl = URL.createObjectURL(file);

        photoPosition = { x: 0, y: 0 };
        photoScale = 1;

        photoPreview.innerHTML = `
            <div
                id="photo-crop"
                style="
                    position: relative;
                    width: 100%;
                    max-width: 300px;
                    aspect-ratio: 0.78;
                    margin: 20px auto;
                    overflow: hidden;
                    border: 2px solid #d5ad65;
                    border-radius: 12px;
                    background: #fffaf0;
                    cursor: grab;
                    touch-action: none;
                "
            >
                <img
                    id="crop-image"
                    src="${photoUrl}"
                    alt="Фото партнера"
                    draggable="false"
                    style="
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        max-width: none;
                        max-height: none;
                        user-select: none;
                        pointer-events: none;
                    "
                >
            </div>

            <button type="button" id="reset-photo">
                Скинути положення фото
            </button>
        `;

        const cropBox = document.querySelector("#photo-crop");
        const cropImage = document.querySelector("#crop-image");
        const resetButton = document.querySelector("#reset-photo");

        const image = new Image();

        image.onload = () => {
            const boxWidth = cropBox.clientWidth;
            const boxHeight = cropBox.clientHeight;

            const baseScale = Math.max(
                boxWidth / image.naturalWidth,
                boxHeight / image.naturalHeight
            );

            cropImage.style.width =
                image.naturalWidth * baseScale + "px";

            cropImage.style.height =
                image.naturalHeight * baseScale + "px";

            updatePhotoPreview();
        };

        image.src = photoUrl;

        function updatePhotoPreview() {
            const boxWidth = cropBox.clientWidth;
            const boxHeight = cropBox.clientHeight;

            const imageWidth = cropImage.offsetWidth * photoScale;
            const imageHeight = cropImage.offsetHeight * photoScale;

            const maxX = Math.max(
                0,
                (imageWidth - boxWidth) / 2
            );

            const maxY = Math.max(
                0,
                (imageHeight - boxHeight) / 2
            );

            photoPosition.x = Math.max(
                -maxX,
                Math.min(photoPosition.x, maxX)
            );

            photoPosition.y = Math.max(
                -maxY,
                Math.min(photoPosition.y, maxY)
            );

            cropImage.style.transform = `
                translate(
                    calc(-50% + ${photoPosition.x}px),
                    calc(-50% + ${photoPosition.y}px)
                )
                scale(${photoScale})
            `;
        }

        let dragging = false;
        let startX = 0;
        let startY = 0;
        let initialX = 0;
        let initialY = 0;

        cropBox.addEventListener("pointerdown", (event) => {
            dragging = true;

            startX = event.clientX;
            startY = event.clientY;

            initialX = photoPosition.x;
            initialY = photoPosition.y;

            cropBox.style.cursor = "grabbing";

            cropBox.setPointerCapture(event.pointerId);
        });

        cropBox.addEventListener("pointermove", (event) => {
            if (!dragging) return;

            photoPosition.x =
                initialX + event.clientX - startX;

            photoPosition.y =
                initialY + event.clientY - startY;

            updatePhotoPreview();
        });

        cropBox.addEventListener("pointerup", () => {
            dragging = false;
            cropBox.style.cursor = "grab";
        });

        cropBox.addEventListener("pointercancel", () => {
            dragging = false;
            cropBox.style.cursor = "grab";
        });

        cropBox.addEventListener(
            "wheel",
            (event) => {
                event.preventDefault();

                photoScale += event.deltaY < 0 ? 0.05 : -0.05;

                photoScale = Math.max(
                    1,
                    Math.min(photoScale, 3)
                );

                updatePhotoPreview();
            },
            { passive: false }
        );

        resetButton.addEventListener("click", () => {
            photoPosition = { x: 0, y: 0 };
            photoScale = 1;

            updatePhotoPreview();
        });
    });

    // =====================================
    // СТВОРЕННЯ СЕРТИФІКАТА
    // =====================================

    certificateForm.addEventListener("submit", (event) => {
        event.preventDefault();

        document.querySelectorAll(
            "#certificate-result .certificate, #certificate-result #download-certificate"
        ).forEach(element => element.remove());

        const partnerName = document
            .querySelector("#partner-name")
            .value
            .trim();

        const partnerStatus = document
            .querySelector("#partner-status")
            .value
            .trim();

        const partnerPercent = document
            .querySelector("#partner-percent")
            .value;

        const photoFile = photoInput.files[0];

        if (
            !photoFile ||
            !partnerName ||
            !partnerStatus ||
            partnerPercent === ""
        ) {
            alert("Будь ласка, заповніть усі поля.");
            return;
        }

        const certificateResult = document.querySelector(
            "#certificate-result"
        );

        // Удаляем предыдущий сертификат и кнопку скачивания
        certificateResult.querySelectorAll(
            ".certificate, #download-certificate"
        ).forEach(element => element.remove());

        certificateResult.innerHTML = `
      <div
        class="certificate"
        style="
          width: 100%;
          max-width: 480px;
          margin: 30px auto;
        "
      >

        <div
          class="certificate-frame"
          style="
            position: relative;
            width: 100%;
            aspect-ratio: 1024 / 1536;
            overflow: hidden;
          "
        >

          <!-- ФОНОВИЙ ШАБЛОН -->

          <img
            src="img/certificate_1.jpg"
            alt="Шаблон сертифіката Mihi"
            style="
              position: absolute;
              inset: 0;
              width: 100%;
              height: 100%;
              object-fit: fill;
              z-index: 1;
            "
          >

          <!-- ІМ'Я ТА ПРІЗВИЩЕ -->

          <div
            style="
              position: absolute;
              left: 10%;
              top: 22%;
              width: 80%;
              min-height: 4%;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              font-family: Georgia, serif;
              font-size: clamp(12px, 3vw, 23px);
              font-weight: bold;
              line-height: 1.2;
              color: #8b5e20;
              z-index: 3;
            "
          >
            ${escapeHTML(partnerName)}
          </div>

          <!-- СТАТУС -->

          <div
            style="
              position: absolute;
              left: 25%;
              top: 28%;
              width: 50%;
              height: 3.5%;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              font-family: Arial, sans-serif;
              font-size: clamp(12px, 3vw, 25px);
              font-weight: bold;
              line-height: 1.2;
              color: #000;
              z-index: 3;
            "
          >
            ${escapeHTML(partnerStatus)}
          </div>

          <!-- ПРОЦЕНТ -->

          <div
            style="
              position: absolute;
              left: 16%;
              top: 45%;
              width: 32.5%;
              height: 13%;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              font-family: Arial, sans-serif;
              font-size: clamp(25px, 7vw, 58px);
              font-weight: bold;
              line-height: 1;
              color: #c58b2e;
              z-index: 3;
            "
          >
            ${escapeHTML(partnerPercent)}%
          </div>

          <!-- ФОТО ПАРТНЕРА -->

          <div
            id="certificate-photo-frame"
            style="
              position: absolute;
              left: 45.5%;
              top: 32.5%;
              width: 43%;
              height: 36.8%;
              overflow: hidden;
              z-index: 2;
            "
          >
            <img
              id="certificate-photo"
              src="${photoUrl}"
              alt="Фото ${escapeHTML(partnerName)}"
              style="
                position: absolute;
                left: 50%;
                top: 50%;
                width: auto;
                height: auto;
                max-width: none;
                max-height: none;
                transform-origin: center center;
                user-select: none;
              "
            >
          </div>
                
        
        </div>
      </div>
    `;

        // =====================================
        // ПЕРЕНЕСЕННЯ ВИБРАНОГО ФОТО
        // =====================================

        const certificatePhoto = document.querySelector(
            "#certificate-photo"
        );

        const certificatePhotoFrame = document.querySelector(
            "#certificate-photo-frame"
        );

        const previewFrame = document.querySelector(
            "#photo-crop"
        );

        const previewImage = document.querySelector(
            "#crop-image"
        );

        if (
            certificatePhoto &&
            certificatePhotoFrame &&
            previewFrame &&
            previewImage
        ) {
            const applyPhotoToCertificate = () => {
                // Розміри рамки конструктора
                const previewWidth = previewFrame.clientWidth;
                const previewHeight = previewFrame.clientHeight;

                // Розміри рамки сертифіката
                const certificateWidth =
                    certificatePhotoFrame.clientWidth;

                const certificateHeight =
                    certificatePhotoFrame.clientHeight;

                if (
                    previewWidth <= 0 ||
                    previewHeight <= 0 ||
                    certificateWidth <= 0 ||
                    certificateHeight <= 0
                ) {
                    console.error("Не вдалося визначити розміри рамок.");
                    return;
                }

                // Окремий масштаб по ширині та висоті
                const scaleX = certificateWidth / previewWidth;
                const scaleY = certificateHeight / previewHeight;

                // Базові розміри фото
                const baseWidth = parseFloat(
                    previewImage.style.width
                );

                const baseHeight = parseFloat(
                    previewImage.style.height
                );

                if (
                    !Number.isFinite(baseWidth) ||
                    !Number.isFinite(baseHeight) ||
                    baseWidth <= 0 ||
                    baseHeight <= 0
                ) {
                    console.error("Не вдалося визначити розмір фото.");
                    return;
                }

                // Переносимо фото
                certificatePhoto.style.width =
                    baseWidth * scaleX + "px";

                certificatePhoto.style.height =
                    baseHeight * scaleY + "px";

                // Переносимо положення фото
                certificatePhoto.style.transform = `
        translate(
            calc(-50% + ${photoPosition.x * scaleX}px),
            calc(-50% + ${photoPosition.y * scaleY}px)
        )
        scale(${photoScale})
    `;
            };

            // Чекаємо завантаження фото
            if (
                certificatePhoto.complete &&
                certificatePhoto.naturalWidth
            ) {
                applyPhotoToCertificate();
            } else {
                certificatePhoto.onload = applyPhotoToCertificate;
            }
        }

        // =====================================
        // КНОПКА ЗАВАНТАЖЕННЯ PNG
        // =====================================

        const downloadButton = document.createElement("button");

        downloadButton.type = "button";
        downloadButton.id = "download-certificate";
        downloadButton.textContent = "Завантажити сертифікат PNG";

        downloadButton.style.cssText = `
            display: block;
            margin: 20px auto;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            background: #c58b2e;
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
        `;

        certificateResult.appendChild(downloadButton);

        downloadButton.addEventListener("click", async () => {
            const certificateFrame = certificateResult.querySelector(
                ".certificate-frame"
            );

            if (!certificateFrame) {
                alert("Сертифікат не знайдено.");
                return;
            }

            if (typeof html2canvas === "undefined") {
                alert("Не завантажено бібліотеку html2canvas.");
                return;
            }

            try {
                const canvas = await html2canvas(certificateFrame, {
                    scale: 3,
                    useCORS: true,
                    backgroundColor: null,
                    logging: false
                });

                const link = document.createElement("a");

                link.download = "mihi-certificate.png";
                link.href = canvas.toDataURL("image/png");

                link.click();
            } catch (error) {
                console.error("Помилка створення PNG:", error);
                alert("Не вдалося завантажити сертифікат.");
            }
        });
    });
});

// =====================================
// КОНСТРУКТОР ЗАПРОШЕННЯ
// =====================================

invitationButton.addEventListener("click", () => {
    document.querySelector("#certificate-result").innerHTML = "";

    editor.innerHTML = `
        <div class="constructor-card">
            <h2>Запрошення в Mihi</h2>

            <form id="invitation-form">

                <label for="invitation-photo">
                    Фото партнера
                </label>

                <input
                    type="file"
                    id="invitation-photo"
                    accept="image/*"
                    required
                >

                <label for="invitation-name">
                    Ім'я та прізвище
                </label>

                <input
                    type="text"
                    id="invitation-name"
                    placeholder="Введіть ім'я та прізвище"
                    required
                >

                <button type="submit">
                    Створити запрошення
                </button>

            </form>
        </div>
    `;
});

// =====================================
// КОНСТРУКТОР ЗАПРОШЕННЯ
// =====================================

invitationButton.addEventListener("click", () => {
    document.querySelector("#certificate-result").innerHTML = "";

    editor.innerHTML = `
        <div class="constructor-card">
            <h2>Запрошення в Mihi</h2>

            <form id="invitation-form">

                <label for="invitation-photo">
                    Фото партнера
                </label>

                <input
                    type="file"
                    id="invitation-photo"
                    accept="image/*"
                    required
                >

                <p>Перетягніть фото мишкою.</p>
                <p>Коліщатко миші — масштабування.</p>

                <div id="invitation-photo-preview"></div>

                <label for="invitation-name">
                    Ім'я та прізвище
                </label>

                <input
                    type="text"
                    id="invitation-name"
                    placeholder="Введіть ім'я та прізвище"
                    required
                >

                <button type="submit">
                    Створити запрошення
                </button>

            </form>
        </div>
    `;

    const form = document.querySelector("#invitation-form");
    const photoInput = document.querySelector("#invitation-photo");
    const preview = document.querySelector("#invitation-photo-preview");

    let invitationPhotoUrl = null;
    let invitationPosition = { x: 0, y: 0 };
    let invitationScale = 1;
    let invitationBaseWidth = 0;
    let invitationBaseHeight = 0;

    // =====================================
    // ЗАВАНТАЖЕННЯ ФОТО
    // =====================================

    photoInput.addEventListener("change", () => {
        const file = photoInput.files[0];

        preview.innerHTML = "";

        if (invitationPhotoUrl) {
            URL.revokeObjectURL(invitationPhotoUrl);
        }

        invitationPhotoUrl = null;

        if (!file) return;

        invitationPhotoUrl = URL.createObjectURL(file);

        invitationPosition = { x: 0, y: 0 };
        invitationScale = 1;

        preview.innerHTML = `
            <div
                id="invitation-crop"
                style="
                    position: relative;
                    width: calc(100% + 38px);
                    max-width: 338px;
                    aspect-ratio: 0.78;
                    margin: 20px auto;
                    overflow: hidden;
                    border: 2px solid #d5ad65;
                    border-radius: 12px;
                    background: #fffaf0;
                    cursor: grab;
                    touch-action: none;
                "
            >
                <img
                    id="invitation-crop-image"
                    src="${invitationPhotoUrl}"
                    alt="Фото партнера"
                    draggable="false"
                    style="
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        max-width: none;
                        max-height: none;
                        user-select: none;
                        pointer-events: none;
                    "
                >
            </div>

            <button
                type="button"
                id="invitation-reset-photo"
            >
                Скинути положення фото
            </button>
        `;

        const crop = document.querySelector("#invitation-crop");
        const cropImage = document.querySelector("#invitation-crop-image");
        const resetButton = document.querySelector("#invitation-reset-photo");

        const image = new Image();

        image.onload = () => {
            const boxWidth = crop.clientWidth;
            const boxHeight = crop.clientHeight;

            const baseScale = Math.max(
                boxWidth / image.naturalWidth,
                boxHeight / image.naturalHeight
            );

            invitationBaseWidth =
                image.naturalWidth * baseScale;

            invitationBaseHeight =
                image.naturalHeight * baseScale;

            cropImage.style.width =
                invitationBaseWidth + "px";

            cropImage.style.height =
                invitationBaseHeight + "px";

            updateInvitationCrop();
        };

        image.src = invitationPhotoUrl;

        // =====================================
        // ОБНОВЛЕНИЕ ПРЕДПРОСМОТРА
        // =====================================

        function updateInvitationCrop() {
            const boxWidth = crop.clientWidth;
            const boxHeight = crop.clientHeight;

            const imageWidth =
                invitationBaseWidth * invitationScale;

            const imageHeight =
                invitationBaseHeight * invitationScale;

            const maxX = Math.max(
                0,
                (imageWidth - boxWidth) / 2
            );

            const maxY = Math.max(
                0,
                (imageHeight - boxHeight) / 2
            );

            invitationPosition.x = Math.max(
                -maxX,
                Math.min(invitationPosition.x, maxX)
            );

            invitationPosition.y = Math.max(
                -maxY,
                Math.min(invitationPosition.y, maxY)
            );

            cropImage.style.transform = `
                translate(
                    calc(-50% + ${invitationPosition.x}px),
                    calc(-50% + ${invitationPosition.y}px)
                )
                scale(${invitationScale})
            `;
        }

        // =====================================
        // ПЕРЕМЕЩЕНИЕ ФОТО
        // =====================================

        let dragging = false;

        let startX = 0;
        let startY = 0;

        let initialX = 0;
        let initialY = 0;

        crop.addEventListener("pointerdown", (event) => {
            dragging = true;

            startX = event.clientX;
            startY = event.clientY;

            initialX = invitationPosition.x;
            initialY = invitationPosition.y;

            crop.style.cursor = "grabbing";

            crop.setPointerCapture(event.pointerId);
        });

        crop.addEventListener("pointermove", (event) => {
            if (!dragging) return;

            invitationPosition.x =
                initialX + event.clientX - startX;

            invitationPosition.y =
                initialY + event.clientY - startY;

            updateInvitationCrop();
        });

        crop.addEventListener("pointerup", () => {
            dragging = false;
            crop.style.cursor = "grab";
        });

        crop.addEventListener("pointercancel", () => {
            dragging = false;
            crop.style.cursor = "grab";
        });

        // =====================================
        // МАСШТАБИРОВАНИЕ
        // =====================================

        crop.addEventListener(
            "wheel",
            (event) => {
                event.preventDefault();

                invitationScale +=
                    event.deltaY < 0 ? 0.05 : -0.05;

                invitationScale = Math.max(
                    1,
                    Math.min(invitationScale, 3)
                );

                updateInvitationCrop();
            },
            { passive: false }
        );

        // =====================================
        // СБРОС ПОЗИЦИИ
        // =====================================

        resetButton.addEventListener("click", () => {
            invitationPosition = { x: 0, y: 0 };
            invitationScale = 1;

            updateInvitationCrop();
        });
    });

    // =====================================
    // СОЗДАНИЕ ПРИГЛАШЕНИЯ
    // =====================================

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const photoFile = photoInput.files[0];

        const partnerName = document
            .querySelector("#invitation-name")
            .value
            .trim();

        if (!photoFile || !partnerName || !invitationPhotoUrl) {
            alert("Завантаж фото та введи ім'я партнера");
            return;
        }

        const invitationTemplate = new Image();

        invitationTemplate.onload = () => {
            const invitationResult = document.createElement("div");

            invitationResult.id = "invitation-result";

            invitationResult.style.cssText = `
                width: 100%;
                max-width: 480px;
                margin: 30px auto;
                position: relative;
                aspect-ratio:
                    ${invitationTemplate.naturalWidth}
                    /
                    ${invitationTemplate.naturalHeight};
                overflow: hidden;
            `;

            invitationResult.innerHTML = `
                <img
                    src="img/certificate_2.jpg"
                    alt="Шаблон запрошення"
                    style="
                        position: absolute;
                        inset: 0;
                        width: 100%;
                        height: 100%;
                        object-fit: fill;
                        z-index: 1;
                    "
                >

                <div
                    id="invitation-final-photo-frame"
                    style="
                        position: absolute;
                        left: 50.8%;
                        top: 25%;
                        width: 43%;
                        height: 41%;
                        overflow: hidden;
                        z-index: 2;
                    "
                >
                    <img
                        id="invitation-final-photo"
                        src="${invitationPhotoUrl}"
                        alt="Фото ${escapeHTML(partnerName)}"
                        style="
                            position: absolute;
                            left: 50%;
                            top: 50%;
                            width: auto;
                            height: auto;
                            max-width: none;
                            max-height: none;
                            transform-origin: center center;
                        "
                    >
                </div>

                <!-- ЗОЛОТІ ПРОМЕНІ ПОВЕРХ ФОТО -->

                <img
                    src="img/certificate_1_rays.png"
                    alt=""
                    style="
                        position: absolute;
                        inset: 0;
                        width: 100%;
                        height: 100%;
                        object-fit: fill;
                        pointer-events: none;
                        z-index: 4;
                    "
                >

                <div
                    style="
                        position: absolute;
                        left: 8%;
                        top: 25%;
                        width: 42%;
                        text-align: center;
                        font-family: Georgia, serif;
                        font-size: clamp(12px, 3vw, 23px);
                        font-weight: bold;
                        color: #8b5e20;
                        z-index: 3;
                    "
                >
                
                    ${escapeHTML(partnerName)}
                </div>
            `;

            const previousResult = document.querySelector(
                "#invitation-result"
            );

            if (previousResult) {
                previousResult.remove();
            }

            editor.appendChild(invitationResult);

            // =====================================
            // ПЕРЕНОС КАДРИРОВАНИЯ НА ГОТОВОЕ ПРИГЛАШЕНИЕ
            // =====================================

            const finalPhoto = invitationResult.querySelector(
                "#invitation-final-photo"
            );

            const finalFrame = invitationResult.querySelector(
                "#invitation-final-photo-frame"
            );

            function applyInvitationCrop() {
                const previewFrame = document.querySelector(
                    "#invitation-crop"
                );

                if (!previewFrame || !finalFrame.clientWidth) {
                    return;
                }

                const scale =
                    finalFrame.clientWidth / previewFrame.clientWidth;

                finalPhoto.style.width =
                    invitationBaseWidth * scale + "px";

                finalPhoto.style.height =
                    invitationBaseHeight * scale + "px";

                finalPhoto.style.transform = `
                translate(
                    calc(-50% + ${invitationPosition.x * scale}px),
                    calc(-50% + ${invitationPosition.y * scale}px)
                )
                scale(${invitationScale})
            `;
            }

            if (
                finalPhoto.complete &&
                finalPhoto.naturalWidth
            ) {
                applyInvitationCrop();
            } else {
                finalPhoto.onload = applyInvitationCrop;
            }

            // =====================================
            // КНОПКА СКАЧИВАНИЯ PNG
            // =====================================

            const downloadButton = document.createElement("button");

            downloadButton.type = "button";
            downloadButton.id = "download-invitation";

            downloadButton.textContent =
                "Завантажити запрошення PNG";

            downloadButton.style.cssText = `
                display: block;
                margin: 20px auto;
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                background: #c58b2e;
                color: white;
                font-weight: bold;
                cursor: pointer;
            `;

            editor.appendChild(downloadButton);

            downloadButton.addEventListener("click", async () => {
                if (typeof html2canvas === "undefined") {
                    alert("Не завантажено бібліотеку html2canvas.");
                    return;
                }

                try {
                    const canvas = await html2canvas(
                        invitationResult,
                        {
                            scale: 3,
                            useCORS: true,
                            backgroundColor: null,
                            logging: false
                        }
                    );

                    const link = document.createElement("a");

                    link.download = "mihi-invitation.png";

                    link.href = canvas.toDataURL("image/png");

                    link.click();

                } catch (error) {
                    console.error(
                        "Помилка створення PNG:",
                        error
                    );

                    alert("Не вдалося завантажити запрошення.");
                }
            });
        };

        invitationTemplate.src = "img/certificate_2.jpg";
    });
});

// =====================================
// ЗАХИСТ ТЕКСТУ
// =====================================

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}