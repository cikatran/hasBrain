package com.mstage.hasbrain.lib.customwebview;

import android.annotation.TargetApi;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.VectorDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.DrawableRes;
import android.support.customtabs.CustomTabsIntent;
import android.support.graphics.drawable.VectorDrawableCompat;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.content.res.AppCompatResources;
import android.util.Log;
import android.view.View;
import android.widget.CheckBox;
import android.widget.EditText;

//import com.hasbrain.lib.customwebview.helper.ActionBroadcastReceiver;
import com.mstage.hasbrain.lib.customwebview.helper.WebviewFallback;

public class MainActivity extends AppCompatActivity implements View.OnClickListener {
    private static final String TAG = "CustChromeTabActivity";
    private static final int TOOLBAR_ITEM_ID = 1;

    private EditText mUrlEditText;
    private EditText mCustomTabColorEditText;
    private EditText mCustomTabSecondaryColorEditText;
    private CheckBox mShowActionButtonCheckbox;
    private CheckBox mAddMenusCheckbox;
    private CheckBox mShowTitleCheckBox;
    private CheckBox mCustomBackButtonCheckBox;
    private CheckBox mAutoHideAppBarCheckbox;
    private CheckBox mAddDefaultShareCheckbox;
    private CheckBox mToolbarItemCheckbox;
    private CustomTabActivityHelper mCustomTabActivityHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mCustomTabActivityHelper = new CustomTabActivityHelper();
        findViewById(R.id.start_custom_tab).setOnClickListener(this);

        mUrlEditText = (EditText) findViewById(R.id.url);
        mCustomTabColorEditText = (EditText) findViewById(R.id.custom_toolbar_color);
        mCustomTabSecondaryColorEditText =
                (EditText) findViewById(R.id.custom_toolbar_secondary_color);
        mShowActionButtonCheckbox = (CheckBox) findViewById(R.id.custom_show_action_button);
        mAddMenusCheckbox = (CheckBox) findViewById(R.id.custom_add_menus);
        mShowTitleCheckBox = (CheckBox) findViewById(R.id.show_title);
        mCustomBackButtonCheckBox = (CheckBox) findViewById(R.id.custom_back_button);
        mAutoHideAppBarCheckbox = (CheckBox) findViewById(R.id.auto_hide_checkbox);
        mAddDefaultShareCheckbox = (CheckBox) findViewById(R.id.add_default_share);
        mToolbarItemCheckbox = (CheckBox) findViewById(R.id.add_toolbar_item);
    }

    @Override
    protected void onStart() {
        super.onStart();
        mCustomTabActivityHelper.bindCustomTabsService(this);
    }

    @Override
    protected void onStop() {
        super.onStop();
        mCustomTabActivityHelper.unbindCustomTabsService(this);
    }

    @Override
    public void onClick(View v) {
                openCustomTab();
    }
    private int getColor(EditText editText) {
        try {
            return Color.parseColor(editText.getText().toString());
        } catch (NumberFormatException ex) {
            Log.i(TAG, "Unable to parse Color: " + editText.getText());
            return Color.LTGRAY;
        }
    }

    public static Bitmap getBitmapFromDrawable(Context context, @DrawableRes int drawableId) {
        Drawable drawable = AppCompatResources.getDrawable(context, drawableId);

        if (drawable instanceof BitmapDrawable) {
            return ((BitmapDrawable) drawable).getBitmap();
        } else if (drawable instanceof VectorDrawableCompat || drawable instanceof VectorDrawable) {
            Bitmap bitmap = Bitmap.createBitmap(drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);
            drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
            drawable.draw(canvas);

            return bitmap;
        } else {
            throw new IllegalArgumentException("unsupported drawable type");
        }
    }

    @TargetApi(Build.VERSION_CODES.M)
    private void openCustomTab() {
        String url = mUrlEditText.getText().toString();

        int color = getColor(mCustomTabColorEditText);
        int secondaryColor = getColor(mCustomTabSecondaryColorEditText);

        CustomTabsIntent.Builder intentBuilder = new CustomTabsIntent.Builder();
        intentBuilder.setToolbarColor(color);
        intentBuilder.setSecondaryToolbarColor(secondaryColor);

        intentBuilder.setCloseButtonIcon(getBitmapFromDrawable(this, R.drawable.ic_arrow_white_24dp));
//
//        if (mShowActionButtonCheckbox.isChecked()) {
//            //Generally you do not want to decode bitmaps in the UI thread. Decoding it in the
//            //UI thread to keep the example short.
//            String actionLabel = getString(R.string.label_action);
//            Bitmap icon = BitmapFactory.decodeResource(getResources(),
//                    android.R.drawable.ic_menu_share);
//            PendingIntent pendingIntent =
//                    createPendingIntent(ActionBroadcastReceiver.ACTION_ACTION_BUTTON);
//            intentBuilder.setActionButton(icon, actionLabel, pendingIntent);
//        }
//
//        if (mAddMenusCheckbox.isChecked()) {
//            String menuItemTitle = getString(R.string.menu_item_title);
//            PendingIntent menuItemPendingIntent =
//                    createPendingIntent(ActionBroadcastReceiver.ACTION_MENU_ITEM);
//            intentBuilder.addMenuItem(menuItemTitle, menuItemPendingIntent);
//        }
//
//        if (mAddDefaultShareCheckbox.isChecked()) {
//            intentBuilder.addDefaultShareMenuItem();
//        }
//
//        if (mToolbarItemCheckbox.isChecked()) {
//            //Generally you do not want to decode bitmaps in the UI thread. Decoding it in the
//            //UI thread to keep the example short.
//            String actionLabel = getString(R.string.label_action);
//            Bitmap icon = BitmapFactory.decodeResource(getResources(),
//                    android.R.drawable.ic_menu_share);
//            PendingIntent pendingIntent =
//                    createPendingIntent(ActionBroadcastReceiver.ACTION_TOOLBAR);
//            intentBuilder.addToolbarItem(TOOLBAR_ITEM_ID, icon, actionLabel, pendingIntent);
//        }

        intentBuilder.setShowTitle(mShowTitleCheckBox.isChecked());

        if (mAutoHideAppBarCheckbox.isChecked()) {
            intentBuilder.enableUrlBarHiding();
        }

//        if (mCustomBackButtonCheckBox.isChecked()) {
//        }

        intentBuilder.setStartAnimations(this, R.anim.slide_in_right, R.anim.slide_out_left);
        intentBuilder.setExitAnimations(this, android.R.anim.slide_in_left,
                android.R.anim.slide_out_right);

        CustomTabActivityHelper.openCustomTab(
                this, intentBuilder.build(), Uri.parse(url), new WebviewFallback());
    }

    private PendingIntent createPendingIntent(int actionSourceId) {
        Intent actionIntent = new Intent();
//        Intent actionIntent = new Intent(
//                this.getApplicationContext(), ActionBroadcastReceiver.class);
//        actionIntent.putExtra(ActionBroadcastReceiver.KEY_ACTION_SOURCE, actionSourceId);
        return PendingIntent.getBroadcast(
                getApplicationContext(), actionSourceId, actionIntent, 0);
    }
}
