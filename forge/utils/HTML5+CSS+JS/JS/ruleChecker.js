ruleChecker: {
	rules: {
		anyChecked: ['edit', 'remove', 'transact', 'cancelTransact'],
		singleChecked: ['edit', 'remove'],
		custom: {
			'remove': (row) => row.Status_Code == 1,
			'transact': undefined,
			'cancelTransact': function(row) {
				if (row.PaymentSheet_ID) {
					//alert(`Откатывать запрещено! (${row.PaymentSheet_ID})`);
					return false;
				}

			},
			'edit': (row) => row.Status_Code == 1,
		}
	},
	
	messages: {
		notify: {
			common: 'Вы уверены?',
			'remove': 'Удалить начисление?',
		},
		error: {
			needSelect: 'Выберите запись!',
			needSingleSelect: 'Нужно выбрать только одну запись!',
			'remove': 'Удалять запись можно только в статусе «Рассчитано»',
			'transact': 'Проводить запись можно только в статусе «Рассчитано»',
			'cancelTransact': 'Откатывать запись можно только в статусе «Проведён»',
			'edit': 'Редактировать запись можно только в статусе «Рассчитано»'
		},
	},

	check: function(event, selectedList) {
		var self = this;
		var currAction = event.target.dataset?.action;
		if (!currAction) return;

		// any checked rule
		if (this.rules.anyChecked.includes(currAction) && selectedList.length == 0) {
			alert(self.messages.error.needSelect);
			return false;
		}

		// single checked rule
		if (this.rules.singleChecked.includes(currAction) && selectedList.length > 1) {
			alert(self.messages.error.needSingleSelect);
			return false;
		}

		// custom rules
		var rule = this.rules.custom[currAction];
		if (rule && typeof rule === "function") {
			var hasInvalidRow = selectedList?.some((row) => !rule(row));
			if (hasInvalidRow) {
				alert(self.messages.error[currAction] || "");
				return false;
			}
		}
		return true;
	},
},
