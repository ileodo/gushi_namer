import $ from 'jquery';
import '../styles/normalize.scss';
import '../styles/radio.scss';
import '../styles/style.scss';
import Namer from './namer';
import { log } from './debugTools';
import { debugMode, defaultBooks, defaultFamilyName, badChars, avoidChars, maxTry } from './config'
  ;

const sel = str => document.querySelector(str);

let timer = null;

function genCheckbox(books) {
  const arr = books.map(b => `
    <div class="inputGroup">
        <input class="book" id="${b.value}" name="book" type="checkbox" value="${b.value}" ${b.checked ? 'checked' : ''}  />
        <label for="${b.value}">${b.name}</label>
      </div>`);
  const html = arr.join('');
  return html;
}

function genNameHtml(obj) {
  if (!obj) {
    return null;
  }
  const {
    name,
    sentence,
    title,
    author,
    book,
    dynasty } = obj;

  const familyName = $('input[name="family-name"]').val();
  const sentenceHtml = sentence.replace(new RegExp(`[${name}]`, 'ig'), char => `<i>${char}</i>`);
  return `
    <li class='name-box'>
        <h3>${familyName}${name}</h3>
        <p class='sentence'>
          <span>「</span>
          ${sentenceHtml}
          <span>」</span>
        </p>
        <div class='source-row' >
          <div class='book'>${book}&nbsp;•&nbsp;${title}</div>
          <div class='author'>[${dynasty}]&nbsp;${author || '佚名'}</div>
        </div>
      </li>`;
}

function setLoading() {
  const interval = 300;
  timer = setTimeout(() => {
    $('.loader').css({
      display: 'block',
    });
  }, interval);
}
function clearLoading() {
  clearTimeout(timer);
  $('.loader').css({
    display: 'none',
  });
  // $('.loader').html('');
}

function createBooksCheckBoxes() {
  let books = [
    { value: 'shijing', name: '诗经'},
    { value: 'chuci', name: '楚辞' },
    { value: 'tangshi', name: '唐诗' },
    { value: 'songci', name: '宋词' },
    { value: 'yuefu', name: '乐府诗集' },
    { value: 'gushi', name: '古诗三百首' },
    { value: 'cifu', name: '著名辞赋' },
    { value: 'custom', name: '自定义' },
  ];

  books.forEach((ele, index)=>{
    if(defaultBooks.includes(ele.value)){
      ele.checked = true;
    }
  });
  if (debugMode) {
    books.push({ value: 'test', name: '测试', checked: true });
  }
  sel('.book-selector').innerHTML = genCheckbox(books);
}

function loadBooks(namer) {
  let books = Array();
  $("input:checkbox[name=book]:checked").each(function(){
    books.push($(this).val());
  });
  setLoading();
  namer.loadBooks(books, () => {
    clearLoading();
    updateActiveBooks(namer);
  });
}

function updateActiveBooks(namer) {
  const fixedName = sel('input[name="fixed-name"]').value;
  setLoading();
  namer.updateActiveBook(fixedName, (activeBook) => {
    clearLoading();
    sel('.btn-go').innerHTML = `起名 (${activeBook.length})`;
  });
}


function initEvents(namer) {
  $('input[name=\'book\']').on("change", (e) => {
    loadBooks(namer);
  });

  $('input[name=\'fixed-name\']').on("change", (e) => {
    updateActiveBooks(namer);
  });

  $('input').on("change", (e) => {
    if(e.target.className === "book")
      return;

    let searchParams = new URLSearchParams(window.location.search)
    searchParams.set(e.target.name, e.target.value);
    history.replaceState(null, null, "?"+searchParams.toString());
  });

  $('#go-to-top').on("click", (e) => {
    window.scrollTo(0,0);
  });

  sel('.btn-go').addEventListener('click', () => {
    setLoading();
    const fixedName = sel('input[name="fixed-name"]').value;
    const nameAmount = sel('input[name="gen-number"]').value;
    const localAvoidChars = sel('input[name="avoid-chars"]').value;

    const html = [];

    let i = 0;
    let totalTry = 0;
    while (totalTry<=maxTry && i <nameAmount)
    {
      totalTry++;

      const nameObj = namer.genName(fixedName.trim(), localAvoidChars.trim());
      if (nameObj === null){
        continue;
      }

      i++;
      html.push(genNameHtml(nameObj));
    }
    $('.result-container').html(html.join(''));
    clearLoading();
  }, false);
}


function main() {
  let searchParams = new URLSearchParams(window.location.search)
  const familyName = searchParams.get("family-name") || defaultFamilyName
  const fixedName = searchParams.get("fixed-name") || ""
  const localAvoidChars = searchParams.get("avoid-chars") || ""
  const genNumber = searchParams.get("gen-number") || 20

  const namer = new Namer(badChars, avoidChars);
  sel('input[name="family-name"]').value = familyName;
  sel('input[name="fixed-name"]').value = fixedName;
  sel('input[name="avoid-chars"]').value = localAvoidChars;
  sel('input[name="gen-number"]').value = genNumber;
  // namer.loadBook('shijing');
  createBooksCheckBoxes();
  loadBooks(namer);
  // initFirstBook();
  initEvents(namer);
  // setLoading();
}


function test() {
  const logStr = (str) => {
    log(`'${str}'`);
  };
  const n = new Namer(badChars, avoidChars);
  const inputs = [
    '<p>习习谷风，以阴以雨。黾勉同心，不宜有怒。采葑采菲，无以下体？德音莫违，及尔同死。</p>',
    ' 记得年时临上马看人眼泪汪汪',
    '惜诵　　惜诵以致愍兮，发愤以抒情。　　所作忠而言之兮，指苍天以为正。　　令五帝使折中兮，戒六神与向服…望大河之洲渚兮，悲申徒之抗迹。　　骤谏君而不听兮，重任石之何益？　　心絓结而不解兮，思蹇产而不释。  ',
  ];
  log(n.splitSentence(inputs[0]));
  logStr(n.formatStr(inputs[0]));
  logStr(n.formatStr(inputs[1]));
}

$(main);

if (debugMode) {
  test();
}

