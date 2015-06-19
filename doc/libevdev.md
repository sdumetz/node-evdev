# Libevdev structures as defined libevdev source code

libevdev is an opaque structure used as reference for a device. Defined in *libevdev-int.h*.

    struct libevdev {
    	int fd;
    	bool initialized;
    	char *name;
    	char *phys;
    	char *uniq;
    	struct input_id ids;
    	int driver_version;
    	unsigned long bits[NLONGS(EV_CNT)];
    	unsigned long props[NLONGS(INPUT_PROP_CNT)];
    	unsigned long key_bits[NLONGS(KEY_CNT)];
    	unsigned long rel_bits[NLONGS(REL_CNT)];
    	unsigned long abs_bits[NLONGS(ABS_CNT)];
    	unsigned long led_bits[NLONGS(LED_CNT)];
    	unsigned long msc_bits[NLONGS(MSC_CNT)];
    	unsigned long sw_bits[NLONGS(SW_CNT)];
    	unsigned long rep_bits[NLONGS(REP_CNT)]; /* convenience, always 1 */
    	unsigned long ff_bits[NLONGS(FF_CNT)];
    	unsigned long snd_bits[NLONGS(SND_CNT)];
    	unsigned long key_values[NLONGS(KEY_CNT)];
    	unsigned long led_values[NLONGS(LED_CNT)];
    	unsigned long sw_values[NLONGS(SW_CNT)];
    	struct input_absinfo abs_info[ABS_CNT];
    	int *mt_slot_vals; /* [num_slots * ABS_MT_CNT] */
    	int num_slots; /**< valid slots in mt_slot_vals */
    	int current_slot;
    	int rep_values[REP_CNT];

    	enum SyncState sync_state;
    	enum libevdev_grab_mode grabbed;

    	struct input_event *queue;
    	size_t queue_size; /**< size of queue in elements */
    	size_t queue_next; /**< next event index */
    	size_t queue_nsync; /**< number of sync events */

    	struct timeval last_event_time;

    	struct {
    		struct mt_sync_state *mt_state;
    		size_t mt_state_sz;		 /* in bytes */
    		unsigned long *slot_update;
    		size_t slot_update_sz;		 /* in bytes */
    		unsigned long *tracking_id_changes;
    		size_t tracking_id_changes_sz;	 /* in bytes */
    	} mt_sync;

    	struct logdata log;
    };

**struct input_id** is defined in *input.h*.

    struct input_id {
    	__u16 bustype;
    	__u16 vendor;
    	__u16 product;
    	__u16 version;
    };
