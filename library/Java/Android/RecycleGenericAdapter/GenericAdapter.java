package com.eande.notestodo.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

/*
This is an generic recycler adapter
You need just create an exemplar in controller
This is an example:
        GenericAdapter<YourModel> adapter = new GenericAdapter<YourModel>(
            // List with your models (List<YourModel>)
            dataList,
            // Layout id for LayoutInflater
            R.layout.item_list_journal,
            // This is an Binder for your model
            // You need set item's data into layout's element
            // Where:
            //      item - selected item of dataList
            //      view - LayoutInflater of current View
            (item, view) -> {
                TextView tvw = view.findViewById(R.id.your_field_id);
                tvw.setText(item.value);
            }
        );
        recyclerView.setAdapter(adapter);
 */
public class GenericAdapter<T> extends RecyclerView.Adapter<GenericAdapter.ViewHolder<T>> {

    private List<T> itemsList;
    private int layoutId;
    private BindViewHolder<T> bindViewHolder;
    private OnItemClickListener onItemClickListener;


    public GenericAdapter(List<T> itemsList, int layoutId, BindViewHolder<T> bindViewHolder) {
        this.itemsList = itemsList;
        this.layoutId = layoutId;
        this.bindViewHolder = bindViewHolder;
    }

    @NonNull
    @Override
    public ViewHolder<T> onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(layoutId, parent, false);
        return new ViewHolder(view, onItemClickListener);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder<T> holder, int position) {
        T item = itemsList.get(position);
        bindViewHolder.bind(item, holder.itemView);
    }

    @Override
    public int getItemCount() {
        return itemsList.size();
    }

    public void updateData(List<T> list) {
        this.itemsList.clear();
        this.itemsList.addAll(list);
        notifyDataSetChanged();
    }

    public void setOnItemClickListener(OnItemClickListener listener) {
        this.onItemClickListener = listener;
    }

    public static class ViewHolder<T> extends RecyclerView.ViewHolder {
        public ViewHolder(@NonNull View itemView, final OnItemClickListener listener) {
            super(itemView);
            itemView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (listener != null) {
                        int position = getAdapterPosition();
                        if (position != RecyclerView.NO_POSITION) {
                            listener.onItemClick(position);
                        }
                    }
                }
            });
        }
    }

    public interface BindViewHolder<T> {
        void bind(T item, View view);
    }

    public interface OnItemClickListener {
        void onItemClick(int position);
    }
}
