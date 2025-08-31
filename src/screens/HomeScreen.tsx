/**
 * COPILOT:
 * Gere um componente React Native TypeScript `HomeScreen`.
 * Requisitos:
 * - Importar e usar useFetchWithCache<Post[]>
 * - Usar FlatList para mostrar `title` e `body`
 * - Implementar pull-to-refresh (calling refresh)
 * - Mostrar ActivityIndicator enquanto loading
 * - Se erro e sem cache, mostrar mensagem e botão "Tentar novamente" que chama refresh
 * - Tipo Post conforme interface
 */
import React, { useMemo } from 'react';
import { ActivityIndicator, Button, FlatList, RefreshControl, SafeAreaView, Text, View } from 'react-native';
import useFetchWithCache from '../hooks/useFetchWithCache';
import { Post } from '../types/api';

const CACHE_KEY = 'posts:list';

export const HomeScreen: React.FC = () => {
  const { data, loading, error, refresh } = useFetchWithCache<Post[]>({
    endpoint: '/posts',
    cacheKey: CACHE_KEY,
  });

  const isEmpty = useMemo(() => (data?.length ?? 0) === 0, [data]);

  if (loading && !data) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ marginBottom: 12, textAlign: 'center' }}>Erro ao carregar posts: {error.message}</Text>
        <Button title="Tentar novamente" onPress={refresh} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {error && data && (
        <View style={{ padding: 8, backgroundColor: '#ffefc1' }}>
          <Text style={{ color: '#8a6d3b' }}>Mostrando dados em cache (offline)</Text>
        </View>
      )}
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        ListEmptyComponent={
          !loading && isEmpty ? (
            <View style={{ padding: 24 }}>
              <Text>Nenhum post.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{item.title}</Text>
            <Text>{item.body}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
