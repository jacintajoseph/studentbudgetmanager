const form = document.getElementById("expenseForm");
const expenseName = document.getElementById("expenseName");
const expenseDate = document.getElementById("expenseDate");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseList = document.getElementById("expenseList");
const totalAmount = document.getElementById("totalAmount");
const budgetInput = document.getElementById("budget");
const remainingAmount = document.getElementById("remainingAmount");
const emptyMessage = document.getElementById("emptyMessage");
const foodTotal = document.getElementById("foodTotal");
const travelTotal = document.getElementById("travelTotal");
const shoppingTotal = document.getElementById("shoppingTotal");
const entertainmentTotal = document.getElementById("entertainmentTotal");
const progressBar = document.getElementById("progressBar");
const searchExpense = document.getElementById("searchExpense");
const highestExpense = document.getElementById("highestExpense");
const lowestExpense = document.getElementById("lowestExpense");
const averageExpense = document.getElementById("averageExpense");
const themeBtn = document.getElementById("themeBtn");
const budgetCard = document.getElementById("budgetCard");
const ctx = document.getElementById('expenseChart');

// New UI elements
const filterCategory = document.getElementById('filterCategory');
const generateReportBtn = document.getElementById('generateReport');
const downloadReportBtn = document.getElementById('downloadReport');
const insightText = document.getElementById('insightText');

let expenseChart = null;

const savedBudget = localStorage.getItem("budget");

if(savedBudget){

    budgetInput.value = savedBudget;

}

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

let total = 0;

function saveExpenses(){
    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );
}

function renderExpenses(){
    expenseList.innerHTML = "";
    total = 0;

    expenses.forEach((exp, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${exp.date || ''}</td>
            <td>${exp.name}</td>
            <td>₹${exp.amount}</td>
            <td>${exp.category}</td>
            <td>
                <button class="deleteBtn" data-name="${exp.name}" data-amount="${exp.amount}" data-category="${exp.category}" data-date="${exp.date || ''}">Delete</button>
            </td>
        `;

        const deleteBtn = row.querySelector(".deleteBtn");
        deleteBtn.addEventListener("click", function(){
            const name = this.dataset.name;
            const amount = Number(this.dataset.amount);
            const category = this.dataset.category;
            const date = this.dataset.date;

            expenses = expenses.filter(function(item){
                return !(item.name === name && Number(item.amount) === amount && item.category === category && (item.date || '') === date);
            });

            saveExpenses();

            total -= amount;

            totalAmount.textContent = `₹${total}`;

            updateRemaining();

            row.remove();

            checkEmpty();
        });

        expenseList.appendChild(row);

        total += Number(exp.amount);
    });

    totalAmount.textContent = `₹${total}`;
    updateRemaining();
}

function displayExpense(name, amount, category, date){

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${date || new Date().toLocaleDateString()}</td>
        <td>${name}</td>
        <td>₹${amount}</td>
        <td>${category}</td>
        <td>
            <button class="deleteBtn">
                Delete
            </button>
        </td>
    `;

    expenseList.appendChild(row);

    const deleteBtn = row.querySelector(".deleteBtn");

    deleteBtn.addEventListener("click", function(){

        expenses = expenses.filter(function(item){

            // match also on date if present to avoid deleting duplicates
            const d = item.date || new Date().toLocaleDateString();
            return !(item.name === name && item.amount === amount && item.category === category && d === (item.date || new Date().toLocaleDateString()));

        });

        saveExpenses();

        total -= amount;

    totalAmount.textContent = `₹${total}`;

        updateRemaining();

    updateCategorySummary();

    updateStatistics();

        row.remove();

        checkEmpty();

    });

    checkEmpty();

}

function checkEmpty(){

    // Transactions table empty?
    const transactionsSection = document.querySelector('#expenses .expense-list');
    const summarySection = document.querySelector('.summary');
    const statsSection = document.querySelector('.stats');

    if(expenseList.children.length === 0){
        if(emptyMessage) emptyMessage.style.display = "block";
        if(transactionsSection) transactionsSection.style.display = 'none';
        if(summarySection) summarySection.style.display = 'none';
        if(statsSection) statsSection.style.display = 'none';

        // hide analytics chart and mini-cards
        const chartContainer = document.querySelector('.chart-container');
        const analyticsGrid = document.querySelector('.analytics-grid');
        if(chartContainer) chartContainer.style.display = 'none';
        if(analyticsGrid) analyticsGrid.style.display = 'none';
    }
    else{
        if(emptyMessage) emptyMessage.style.display = "none";
        if(transactionsSection) transactionsSection.style.display = '';
        if(summarySection) summarySection.style.display = '';
        if(statsSection) statsSection.style.display = '';

        // show analytics chart and mini-cards
        const chartContainer = document.querySelector('.chart-container');
        const analyticsGrid = document.querySelector('.analytics-grid');
        if(chartContainer) chartContainer.style.display = '';
        if(analyticsGrid) analyticsGrid.style.display = '';
    }

}

function updateRemaining(){
    const budget = Number(budgetInput.value) || Number(localStorage.getItem('budget')) || 0;
    const remaining = budget - total;
    remainingAmount.textContent = `₹${remaining}`;

    // update budget card display
    budgetCard.textContent = `₹${budget}`;

    if(remaining < 0){
        alert("Budget Exceeded!");
    }

    // Update progress bar
    const percentage = budget > 0 ? (total / budget) * 100 : 0;
    progressBar.style.width = percentage + "%";

    if(percentage > 90){

        progressBar.style.background = "red";

    }
    else{

        progressBar.style.background = "green";

    }
}

budgetInput.addEventListener('input', function(){
    localStorage.setItem('budget', budgetInput.value);
    updateRemaining();
});

form.addEventListener("submit", function(event){
    event.preventDefault();

    const name = expenseName.value;
    const date = expenseDate.value || new Date().toISOString().slice(0,10);
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;

    if(
        name === "" ||
        amount <= 0 ||
        category === ""
    ){
        alert("Please fill all fields");
        return;
    }

    expenses.push({
        name,
        date,
        amount,
        category
    });

    saveExpenses();

    // display with provided date
    displayExpense(name, amount, category, date);

    total += amount;

    totalAmount.textContent = `₹${total}`;

    updateRemaining();

    updateCategorySummary();

    updateStatistics();

    form.reset();
});

// initial render on load using displayExpense so delete handlers behave correctly
expenses.forEach(function(expense){

    // ensure displayExpense shows the stored date by temporarily using the stored value
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${expense.date || ''}</td>
        <td>${expense.name}</td>
        <td>₹${expense.amount}</td>
        <td>${expense.category}</td>
        <td>
            <button class="deleteBtn" data-name="${expense.name}" data-amount="${expense.amount}" data-category="${expense.category}" data-date="${expense.date || ''}">Delete</button>
        </td>
    `;

    // attach delete handler similar to renderExpenses
    const deleteBtn = row.querySelector('.deleteBtn');
    deleteBtn.addEventListener('click', function(){
        const name = this.dataset.name;
        const amount = Number(this.dataset.amount);
        const category = this.dataset.category;
        const date = this.dataset.date;

        expenses = expenses.filter(function(item){
            return !(item.name === name && Number(item.amount) === amount && item.category === category && (item.date || '') === date);
        });

        saveExpenses();
        total -= amount;
        totalAmount.textContent = `₹${total}`;
        updateRemaining();
        row.remove();
        checkEmpty();
    });

    expenseList.appendChild(row);

    total += expense.amount;

});

totalAmount.textContent = `₹${total}`;

updateRemaining();

checkEmpty();

updateCategorySummary();

updateStatistics();

// Tab navigation helper
function showSection(sectionId){

    document.querySelectorAll('main section').forEach(section => {
        section.style.display = 'none';
    });

    const el = document.getElementById(sectionId);
    if(el) el.style.display = 'block';

    // If analytics, update chart size
    if(sectionId === 'analytics' && expenseChart){
        expenseChart.resize();
    }

}

// show dashboard by default
showSection('dashboard');

// Search + Filter handler
function applySearchAndFilter(){
    const value = (searchExpense ? searchExpense.value : '').toLowerCase();
    const selectedCategory = (filterCategory ? filterCategory.value : 'All');
    const rows = expenseList.querySelectorAll('tr');
    rows.forEach(function(row){
        const text = row.textContent.toLowerCase();
        const matchesSearch = text.includes(value);
        const matchesFilter = selectedCategory === 'All' ? true : text.includes(selectedCategory.toLowerCase());
        row.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
    });
}

if(searchExpense){
    searchExpense.addEventListener('keyup', applySearchAndFilter);
}

if(filterCategory){
    filterCategory.addEventListener('change', applySearchAndFilter);
}

// Theme toggle
themeBtn.addEventListener(
"click",
function(){

    document.body.classList.toggle("dark-mode");
    // toggle label
    if(document.body.classList.contains('dark-mode')){
        themeBtn.textContent = 'Light Mode';
    } else {
        themeBtn.textContent = 'Dark Mode';
    }

    // update chart colors if needed
    if(expenseChart) expenseChart.update();

}
);

// Set initial theme button label on load
if(themeBtn){
    if(document.body.classList.contains('dark-mode')){
        themeBtn.textContent = 'Light Mode';
    } else {
        themeBtn.textContent = 'Dark Mode';
    }
}

function updateCategorySummary(){

    let food = 0;
    let travel = 0;
    let shopping = 0;
    let entertainment = 0;

    expenses.forEach(function(expense){

        if(expense.category === "Food")
            food += expense.amount;

        else if(expense.category === "Travel")
            travel += expense.amount;

        else if(expense.category === "Shopping")
            shopping += expense.amount;

        else if(expense.category === "Entertainment")
            entertainment += expense.amount;

    });

    foodTotal.textContent = `₹${food}`;
    travelTotal.textContent = `₹${travel}`;
    shoppingTotal.textContent = `₹${shopping}`;
    entertainmentTotal.textContent = `₹${entertainment}`;

    // update pie chart
    const data = [food, travel, shopping, entertainment];

    if(!expenseChart){
        expenseChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Food','Travel','Shopping','Entertainment'],
                datasets: [{
                    data: data,
                    backgroundColor: ['#ff6384','#36a2eb','#ffcd56','#4bc0c0']
                }]
            }
        });
    }
    else{
        expenseChart.data.datasets[0].data = data;
        expenseChart.update();
    }

    // generate insights after updating summary
    generateInsight(food, travel, shopping, entertainment, total);
    generateRecommendations(food, travel, shopping, entertainment, total);

}

function generateRecommendations(food, travel, shopping, entertainment, total){
    const list = document.getElementById('recommendationList');
    if(!list) return;
    list.innerHTML = '';

    if(total === 0){
        const li = document.createElement('li');
        li.textContent = 'No spending yet — start by adding an expense.';
        list.appendChild(li);
        return;
    }

    const budget = Number(budgetInput.value) || Number(localStorage.getItem('budget')) || 0;
    const remaining = budget - total;

    const perc = (x) => Math.round((x/total)*100);
    const foodPerc = perc(food);
    const travelPerc = perc(travel);
    const shoppingPerc = perc(shopping);
    const entPerc = perc(entertainment);

    // Recommendation 1: highest category
    const amounts = [{k:'Food',v:food},{k:'Travel',v:travel},{k:'Shopping',v:shopping},{k:'Entertainment',v:entertainment}];
    amounts.sort((a,b)=>b.v-a.v);
    const highestCat = amounts[0].v > 0 ? amounts[0].k : 'None';
    const li1 = document.createElement('li');
    li1.textContent = `${highestCat} spending is your highest category.`;
    list.appendChild(li1);

    // Recommendation 2: budget remaining
    const li2 = document.createElement('li');
    if(budget > 0){
        const percentRem = Math.round((remaining / budget) * 100);
        li2.textContent = `You still have ${percentRem}% of your budget available.`;
    } else {
        li2.textContent = 'No budget set — consider setting a monthly budget.';
    }
    list.appendChild(li2);

    // Recommendation 3: health check
    const li3 = document.createElement('li');
    if(foodPerc > 60){
        li3.textContent = 'Food spending is high — consider reducing eating-out expenses.';
    } else if(shoppingPerc > 50){
        li3.textContent = 'Shopping is taking a large share — consider delaying non-essential purchases.';
    } else {
        li3.textContent = 'Current spending pattern looks healthy.';
    }
    list.appendChild(li3);

}

function generateInsight(food, travel, shopping, entertainment, total){
    if(!insightText) return;
    if(total === 0){
        insightText.textContent = 'No expenses yet.';
        return;
    }

    const cats = {Food:food, Travel:travel, Shopping:shopping, Entertainment:entertainment};
    const highestVal = Math.max(food, travel, shopping, entertainment);
    let highestCat = Object.keys(cats).find(k => cats[k] === highestVal) || 'None';

    const messages = [];
    if(food > total * 0.6){
        messages.push(`You spent ${Math.round((food/total)*100)}% of your expenses on Food.`);
    }
    else if(food > total * 0.5){
        messages.push('Majority of spending is on Food.');
    }

    messages.push(`Your highest spending category is ${highestCat}.`);

    const budget = Number(budgetInput.value) || Number(localStorage.getItem('budget')) || 0;
    const remaining = budget - total;
    messages.push(`You have ₹${remaining} remaining.`);

    insightText.textContent = messages.join(' ');
}

// Generate Report
if(generateReportBtn){
    generateReportBtn.addEventListener('click', function(){
        const month = (new Date()).toLocaleString('default', { month: 'long' });
        const budget = Number(budgetInput.value) || 0;
        const spent = total;
        const remaining = budget - spent;
        const cats = [
            {k:'Food',v: Number(foodTotal.textContent.replace('₹','')||0)},
            {k:'Travel',v: Number(travelTotal.textContent.replace('₹','')||0)},
            {k:'Shopping',v: Number(shoppingTotal.textContent.replace('₹','')||0)},
            {k:'Entertainment',v: Number(entertainmentTotal.textContent.replace('₹','')||0)}
        ];
        cats.sort((a,b)=>b.v-a.v);
        const highest = cats.length ? cats[0].k : 'None';
        const report = `Month: ${month}\nBudget: ₹${budget}\nSpent: ₹${spent}\nRemaining: ₹${remaining}\nHighest Category: ${highest}`;
        if(insightText) insightText.textContent = report.split('\n').join(' | ');
        console.log(report);
    });
}

// Download PDF using jsPDF
if(downloadReportBtn){
    downloadReportBtn.addEventListener('click', function(){
        if(!window.jspdf){
            alert('jsPDF not available');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const month = (new Date()).toLocaleString('default', { month: 'long' });
        const budget = Number(budgetInput.value) || 0;
        const spent = total;
        const remaining = budget - spent;
        const cats = [
            {k:'Food',v: Number(foodTotal.textContent.replace('₹','')||0)},
            {k:'Travel',v: Number(travelTotal.textContent.replace('₹','')||0)},
            {k:'Shopping',v: Number(shoppingTotal.textContent.replace('₹','')||0)},
            {k:'Entertainment',v: Number(entertainmentTotal.textContent.replace('₹','')||0)}
        ];
        cats.sort((a,b)=>b.v-a.v);
        const highest = cats.length ? cats[0].k : 'None';

        doc.setFontSize(16);
        doc.text('Student Budget Report', 14, 20);
        doc.setFontSize(12);
        doc.text(`Month: ${month}`, 14, 36);
        doc.text(`Budget: ₹${budget}`, 14, 48);
        doc.text(`Spent: ₹${spent}`, 14, 60);
        doc.text(`Remaining: ₹${remaining}`, 14, 72);
        doc.text(`Highest Category: ${highest}`, 14, 84);

        doc.save('Student_Budget_Report.pdf');
    });
}

function updateStatistics(){

    if(expenses.length === 0){

        highestExpense.textContent = 0;
        lowestExpense.textContent = 0;
        averageExpense.textContent = 0;

        return;

    }

    const amounts = expenses.map(e => e.amount);

    const highest = Math.max(...amounts);

    const lowest = Math.min(...amounts);

    const average = amounts.reduce((a,b)=>a+b,0) / amounts.length;

    highestExpense.textContent = `₹${highest}`;

    lowestExpense.textContent = `₹${lowest}`;

    averageExpense.textContent = `₹${average.toFixed(2)}`;

}

// ======================
// REGISTRATION PAGE CODE
// ======================

const registrationForm =
    document.getElementById("registrationForm");

const registrationCard =
    document.getElementById("registrationCard");

if (registrationForm) {

    registrationForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            const name =
                document.getElementById("regName").value.trim();

            const email =
                document.getElementById("regEmail").value.trim();

            const password =
                document.getElementById("regPassword").value;

            const dob =
                document.getElementById("regDob").value;

            const course =
                document.getElementById("regCourse").value;

            const photo =
                document.getElementById("regPhoto").files[0];

            // Validation
            if (
                name === "" ||
                email === "" ||
                password === "" ||
                dob === "" ||
                course === "" ||
                !photo
            ) {
                alert("Please fill all fields.");
                return;
            }

            const imageURL =
                URL.createObjectURL(photo);

            registrationCard.style.display = "block";

            registrationCard.innerHTML = `
                <h2>Registration Details</h2>

                <img
                    src="${imageURL}"
                    class="registration-image"
                >

                <p><strong>Name:</strong> ${name}</p>

                <p><strong>Email:</strong> ${email}</p>

                <p><strong>Password:</strong> ${password}</p>

                <p><strong>Date of Birth:</strong> ${dob}</p>

                <p><strong>Course:</strong> ${course}</p>
            `;

            registrationForm.reset();
        }
    );

}