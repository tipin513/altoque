const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCategories() {
    // 1. Delete ID 26 (slug: 'fletes')
    console.log('Deleting ID 26 (slug: fletes)...');
    const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', 26);

    if (deleteError) {
        console.error('Error deleting ID 26:', deleteError);
    } else {
        console.log('ID 26 deleted successfully.');
    }

    // 2. Update ID 13 (slug: 'fletes-mudanzas') with icon 'Truck'
    console.log('Updating ID 13 (slug: fletes-mudanzas) with icon Truck...');
    const { error: updateError } = await supabase
        .from('categories')
        .update({ icon: 'Truck' })
        .eq('id', 13);

    if (updateError) {
        console.error('Error updating ID 13:', updateError);
    } else {
        console.log('ID 13 updated successfully.');
    }
}

fixCategories();
