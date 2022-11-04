			// получаем кнопки
			btnAsyncInfo = document.getElementById("btnAsyncInfo");
			btnAsyncElem = document.getElementById("btnAsyncElem");
			btnClear =document.getElementById("btnClear");
			// получаем информационные элементы
			var selectCurrency = document.getElementsByName("сurrency")[0]; // выпадающий список
			var currencyList = document.getElementById("CurrencyList"); // список результата
			var errorInfo = document.getElementById("ErrorInfo"); // элемент ошибки
			/* ----------------- Acинхронный Ajax-запрос. ---------------------- */

			var requestElem = new XMLHttpRequest();
			var requestInfo = new XMLHttpRequest();

			//Метод для обработки состояний 
			// Примечание: если будем вызывать после выполнения всего запроса, то ошибка не будет обработана (не войдет в блок)
			function handlerStateChangeElem() {
				if (requestElem.readyState == 4) {
					var status = requestElem.status;
					if (status != 200) {
							errorInfo.innerHTML = "Ошибка. Не удалось получить данные...";
							
					} else {
						// извлекаем данные
						data = JSON.parse(requestElem.responseText);	
						// получаем текущий элемент из выпадающего списка
						var value = selectCurrency.value;
						// если не удалось получить -> ошибка
						if (data[value] == undefined)
						{
							errorInfo.innerHTML = "Ошибка. Не удалось получить данные...";
							return;
						}					
						// генерируем результат
						generateList(data[value]);
					}
				}
			}
			
			//Асинхронный вызов
			function asyncRequestElem(){
				// Устанавливаем обработчик события изменения состояния запроса последовательно
				requestElem.onload = null;		
				requestElem.onreadystatechange = handlerStateChangeElem;						
				requestElem.open("GET", "https://www.blockchain.com/ru/ticker", true);
				// очистить данные
				clearInfo();
				requestElem.send();	
			}
			
			function generateList(value){
				// записываем данные в массив
				var info = ['Последняя стоимость: ' + value["last"] + " " + value["symbol"],
				'Стоимость покупки: ' + value["buy"] + " " + value["symbol"],
				'Стоимость продажи: ' + value["sell"] + " " + value["symbol"]]; 
				// Примечание: можно было создать отдельные блочные элементы, однако хотелось вставить код генерации.
				
				// выводим данные
				for (var i = 0, ln = info.length; i < ln; i++) {
				  var li = document.createElement('li');
				  li.innerHTML = info[i];
				  currencyList.appendChild(li);
				}	
			}
			
			let valueSelect = selectCurrency.value; // сохраняем данные
			
			//Метод для обработки состояний (будем вызывать после выполнения всего запроса)
			// Примечание: если будем вызывать после выполнения всего запроса, то ошибка не будет обработана (не войдет в блок)
			function handlerStateChangeInfo() {
				if (requestInfo.readyState == 4) {
					var status = requestInfo.status;
					if (status != 200) {
						// очистить данные
						clearInfo();
						errorInfo.innerHTML = "Ошибка. Не удалось получить данные...";
						btnAsyncElem.disabled = true; // отключаем кнопку в случае ошибки... (опрос каждую минуту)
						// остановить запросы данных по элементам
						setStateIntervalElem(false);
					} else {
						// извлекаем данные
						data = JSON.parse(requestInfo.responseText);	
						// если не удалось получить -> ошибка
						if (data == undefined || data.length == 0)
						{
							// очистить данные
							clearInfo();
							errorInfo.innerHTML = "Не удалось получить данные о платежных вариантах...";
							// остановить запросы данных по элементам
							setStateIntervalElem(false);
							return;
						}
						// открываем кнопку обновления
						btnAsyncElem.enabled = true; 
						// генерируем результат
						generateSelect(data);	
						// включаем запрос через интервал (час идет заново)
						setStateIntervalElem(true);
						// если value существует - возвращаем значение valueSelect в select (чтобы пользователь не замечал обновления)
						setSavedValue();
					}
				}
			}

			// Асинхронный вызов данных - какие есть единицы измерения
			function asyncRequestInfo(){
				// Устанавливаем обработчик события изменения состояния запроса последовательно
				requestInfo.onload = null;		
				requestInfo.onreadystatechange = handlerStateChangeInfo;						
				requestInfo.open("GET", "https://www.blockchain.com/ru/ticker", true);
				requestInfo.send();		
			}


			function generateSelect(data){
				selectCurrency.innerHTML = "";
				Object.keys(data).forEach(element => {
						var option = document.createElement("option");
						option.value = element;
						option.text = element;
						selectCurrency.appendChild(option);
					}
				);

			}

			// выполняем действия запроса по времени
			// повторить с интервалом 1 час = 60 минут = 60*60секунд = 60*60*1000 мс
			setInterval(() => asyncRequestInfo(),  60*60*1000);

			// переменная, сохраняющая значения состояний
			let isTimeEventElem = false;	

			// изменяем состояния для asyncRequestElem
			function setStateIntervalElem(isOn) {
				// если включение
				if (isOn)
				{
					if (!isTimeEventElem)
						// выполняем действия запроса по времени
						// повторить с интервалом 1 час = 60 минут = 60*60секунд = 60*60*1000 мс
						setInterval(() => asyncRequestElem(), 60*60*1000);
				}
				else
					if (isTimeEventElem)
						clearInterval(() => asyncRequestElem()); // отключаем запросы по времени для asyncRequestElem
			}
			
			// вызываем функцию включения таймера
			setStateIntervalElem(true);
			
			
			
			// очистить данные
			function clearInfo(){
				// производим очистку массива
				currencyList.innerHTML="";
				// производим очистку ошибок
				errorInfo.innerHTML = "";
			}
			
			// накладываем обработку событий
			document.getElementById("btnAsyncInfo").addEventListener('click', asyncRequestInfo); // ставим прослушку события на нажатие btnAsyncInfo
			document.getElementById("btnAsyncElem").addEventListener('click', asyncRequestElem); // ставим прослушку события на нажатие btnAsyncElem
			document.getElementById("btnClear").addEventListener('click', clearInfo); // ставим прослушку события на нажатие btnClear		
			// получаем текущий элемент из выпадающего списка - отлавливаем событие изменения
			selectCurrency.addEventListener('change', function (e) {
				valueSelect = e.target.value
				}
			)	

			function setSavedValue()
			{
				childrens = selectCurrency.children;
				var value = -1;
				for (var i = 0; i < childrens.length; i++)
					if (childrens[i].value == valueSelect)
					{
						value = i;
						break;
					}
					
				if (value!=-1)
					selectCurrency.selectedIndex = i;
					
			}
			
