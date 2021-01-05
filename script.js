const searchString = document.querySelector('.search__string');
const autoComplitBlock = document.querySelector('.search__autocomplit-block');
const repoList = document.querySelector('.repo-list');

//======================================================================================================
// Блок функций отвечающих за получение данных DATA;

const getData = (search) => {
    return fetch(
        `https://api.github.com/search/repositories?q=${search}&sort=stars&order=desc&per_page=5`,
    )
        .then((resolve) => {
            if (resolve.ok) {
                renderAutoComplite(resolve.json());
            } else
                throw new Error(
                    `Ошибка при получении данных! \n Код ошибки: ${resolve.status} \n URL запроса: ${resolve.url}`,
                );
        })
        .catch((e) => console.error(`Ошибка при получении данных! ${e}`));
};

const debounce = (fn, debounceTime) => {
    let timeOut;

    return function () {
        const call = () => {
            fn.apply(this, arguments);
        };
        clearTimeout(timeOut);

        timeOut = setTimeout(call, debounceTime);
    };
};

const getDataDebounce = debounce(getData, 300);

//=======================================================================================================
// Блок функций отвечающих за создание AUTOCOMPLITE;

const renderAutoComplite = (data) => {
    cleanAutoComplite();

    data.then(({ items }) => {
        items.forEach((repoData) => {
            autoComplitBlock.append(createAutoString(repoData));
        });
    });
};

const createAutoString = (dataStr) => {
    const { name, owner, stargazers_count, language, id } = dataStr;
    const paragraph = document.createElement('p');

    paragraph.classList.add('search__auto-string');
    paragraph.setAttribute('data-id', id);
    paragraph.setAttribute('data-owner', owner.login);
    paragraph.setAttribute('data-star', stargazers_count);
    paragraph.setAttribute('data-lang', language);

    paragraph.innerText = name;

    return paragraph;
};

const cleanAutoComplite = () => {
    const autoStringArr = Array.from(autoComplitBlock.children);

    if (autoStringArr.length > 0) {
        autoStringArr.forEach((string) => string.remove());
    }
};

//=======================================================================================================
// Блок функций отвечающих за работу REPO-LIST;

const addItemToRepoList = (item) => {
    const { owner, star, lang, id } = item.dataset;

    if (checkId(id)) {
        const createP = (data) => {
            const par = document.createElement('p');
            par.classList.add('repo-list__text');
            par.innerText = data;

            return par;
        };

        const removeBtn = document.createElement('button');
        removeBtn.classList.add('repo-list__remove-btn');
        removeBtn.innerHTML = '&#10060;';
        removeBtn.addEventListener('click', (e) => {
            e.target.parentElement.remove();
        });

        const block = document.createElement('div');
        block.classList.add('repo-list__item');
        block.setAttribute('data-id', id);

        block.append(createP(item.innerText));
        block.append(createP(owner));
        block.append(createP(star));
        block.append(createP(lang));
        block.append(removeBtn);

        repoList.append(block);
    }
};

const checkId = (id) => {
    let result = true;
    const repoItems = Array.from(repoList.children);

    repoItems.forEach((item) => {
        if (item.dataset.id === id) {
            result = false;
        }
    });

    return result;
};

searchString.addEventListener('input', () => {
    if (searchString.value) {
        getDataDebounce(searchString.value);
    } else {
        setTimeout(() => {
            cleanAutoComplite();
        }, 350);
    }
});

autoComplitBlock.addEventListener('click', (e) => {
    if (e.target !== autoComplitBlock) {
        addItemToRepoList(e.target);
    }
});
