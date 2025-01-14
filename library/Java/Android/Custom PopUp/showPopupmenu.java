//The method allows you to display your popups on the activity
//Set up a showPopupMenu call with a View passed


private void showPopupMenu(View anchorView) {
    LayoutInflater inflater = (LayoutInflater) getSystemService(LAYOUT_INFLATER_SERVICE);
    View popupView = inflater.inflate(R.layout.menu_custom_journal_entity_top, null);

    int width = ConstraintLayout.LayoutParams.WRAP_CONTENT;
    int height = ConstraintLayout.LayoutParams.WRAP_CONTENT;
    
    boolean focusable = true;
    final PopupWindow popupWindow = new PopupWindow(popupView, width, height, focusable);

    if (android.os.Build.VERSION.SDK_INT >= 21) {
        popupWindow.setElevation(5.0f);
    }

    float density = getResources().getDisplayMetrics().density;
    int xOffset = Math.round(-250 * density);
    int yOffset = Math.round(0 * density);

    // Displaying PopupWindow (Choose one for your needs)
    
    // Method for positioning relative to the calling element
    // parameters 2 and 3 - xoff and yoff for offset relative to the initial positioning
    popupWindow.showAsDropDown(anchorView, xOffset, yOffset);
    
    //!!!OR
    
    // Method for positioning relative to the screen
    // parameter 2 - main positioning relative to the screen        
    popupWindow.showAtLocation(anchorView.getRootView(), Gravity.CENTER, xOffset, yOffset);

    // Set an listener for menu element
    ImageButton menuItem1 = popupView.findViewById(R.id.menu_menuItem1);
    menuItem1.setOnClickListener(new View.OnClickListener() {
        @Override
        public void onClick(View v) {
            popupWindow.dismiss();
        }
    });
}