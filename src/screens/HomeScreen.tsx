// Tela Home: lista posts com cache e suporte offline.
import React, { useMemo } from 'react';
import { ActivityIndicator, Button, FlatList, RefreshControl, SafeAreaView, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'react-native';
import useFetchWithCache from '../hooks/useFetchWithCache';
import { Post } from '../types/api';

const CACHE_KEY = 'posts:list';

export const HomeScreen: React.FC = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { data, loading, error, refresh, lastUpdated } = useFetchWithCache<Post[]>({
    endpoint: '/posts',
    cacheKey: CACHE_KEY,
  });

  const isEmpty = useMemo(() => (data?.length ?? 0) === 0, [data]);

  if (loading && !data) {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <ActivityIndicator color="#fff" />
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <Text style={styles.message}>Erro ao carregar posts: {error.message}</Text>
        <Button title="Tentar novamente" onPress={refresh} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex}>
      <LinearGradient
        colors={isDark ? ['#000000', '#0d0d10'] : ['#ffffff', '#e9eef5']}
        style={styles.gradient}
      >
      {error && data && (
        <View style={styles.bannerWarning}>
          <Text style={styles.bannerWarningText}>Mostrando dados em cache (offline)</Text>
        </View>
      )}
      {lastUpdated && (
        <View style={styles.bannerInfo}>
          <Text style={styles.bannerInfoText}>Última atualização: {new Date(lastUpdated).toLocaleTimeString()}</Text>
        </View>
      )}
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        ListEmptyComponent={
          !loading && isEmpty ? (
            <View style={styles.empty}>
              <Text style={[styles.text, isDark ? null : styles.textDark]}>Nenhum post.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={[styles.itemTitle, isDark ? null : styles.textDark]}>{item.title}</Text>
            <Text style={[styles.text, isDark ? null : styles.textDark]}>{item.body}</Text>
          </View>
        )}
      />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradient: { flex: 1 },
  container: { flex: 1, backgroundColor: '#000' },
  containerCenter: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 16 },
  text: { color: '#fff' },
  textDark: { color: '#111' },
  message: { color: '#fff', marginBottom: 12, textAlign: 'center' },
  item: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#333' },
  itemTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 4 },
  empty: { padding: 24 },
  bannerWarning: { padding: 8, backgroundColor: '#4d3b00' },
  bannerWarningText: { color: '#ffdf7b', fontSize: 12 },
  bannerInfo: { padding: 8, backgroundColor: '#111' },
  bannerInfoText: { color: '#bbb', fontSize: 12 },
});
