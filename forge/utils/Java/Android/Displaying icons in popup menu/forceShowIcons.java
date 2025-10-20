//The method allows you to add icon rendering to the popup menu (which cannot be done via xml resource files)	
	
//In the activity where the menu is located, you need to add a call to forceShowIcons(menu) in the onCreateOptionsMenu method;

@Override
public boolean onCreateOptionsMenu(Menu menu) {
    getMenuInflater().inflate(R.menu.menu_journal_entity_top, menu);

    forceShowIcons(menu);
    return true;
}

//The method sets the rendering
private void forceShowIcons(Menu menu) {
    try {
        if (menu.getClass().getSimpleName().equals("MenuBuilder")) {
            Field field = menu.getClass().getDeclaredField("mOptionalIconsVisible");
            field.setAccessible(true);
            field.setBoolean(menu, true);
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}